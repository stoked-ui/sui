pub mod blog;

use crate::client::{parse_kv_pairs, parse_optional_json_body, print_value, ApiClient};
use crate::config::StoredConfig;
use anyhow::{anyhow, bail, Context, Result};
use clap::{Args, Subcommand};
use reqwest::Method;
use serde_json::{json, Value};
use std::path::PathBuf;

const CDN_MULTIPART_THRESHOLD_BYTES: usize = 5 * 1024 * 1024;
const CDN_URL_BATCH_SIZE: usize = 50;

fn should_use_cdn_multipart_upload(client: &ApiClient, content_len: usize) -> bool {
    !client.is_localhost() && content_len >= CDN_MULTIPART_THRESHOLD_BYTES
}

fn build_deliverable_cdn_path(
    client_slug: &str,
    bundle_id: &str,
    rel_path: &str,
) -> Result<String> {
    let normalized_client_slug = client_slug.trim().trim_matches('/').to_lowercase();
    let normalized_bundle_id = bundle_id.trim().trim_matches('/');
    let normalized_rel_path = rel_path
        .trim()
        .replace('\\', "/")
        .trim_start_matches('/')
        .to_string();

    if normalized_client_slug.is_empty() {
        bail!("client slug is invalid");
    }
    if normalized_bundle_id.is_empty() {
        bail!("bundle id is invalid");
    }
    if normalized_rel_path.is_empty() || normalized_rel_path.contains("..") {
        bail!("relative file path is invalid");
    }

    Ok(format!(
        "clients/{}/deliverables/{}/{}",
        normalized_client_slug, normalized_bundle_id, normalized_rel_path
    ))
}

fn validate_html_deliverable_bundle(
    bundle_name: &str,
    bundle_path: &std::path::Path,
    files_to_upload: &[(PathBuf, String)],
    index_file: &str,
) -> Result<()> {
    let rel_paths = files_to_upload
        .iter()
        .map(|(_, rel_path)| rel_path.as_str())
        .collect::<Vec<_>>();

    let looks_like_next_bundle = rel_paths.contains(&"index_files/webpack.js")
        && rel_paths.contains(&"index_files/_buildManifest.js");

    if !looks_like_next_bundle {
        return Ok(());
    }

    let index_html = std::fs::read_to_string(bundle_path.join(index_file)).with_context(|| {
        format!(
            "Failed reading '{}' while validating bundle '{}'",
            index_file, bundle_name
        )
    })?;

    if index_html.contains("saved from url=")
        || index_html.contains("chrome-extension://")
        || index_html.contains("http://localhost:5199")
    {
        bail!(
            "Bundle '{}' looks like a browser-saved localhost page, not a self-contained export. Rebuild the deliverable bundle instead of using Save Page As.",
            bundle_name
        );
    }

    let has_nested_static_assets = rel_paths
        .iter()
        .any(|rel_path| rel_path.starts_with("index_files/static/"));

    if !has_nested_static_assets {
        bail!(
            "Bundle '{}' includes a Next.js runtime but is missing 'index_files/static/...'. Re-export the full bundle before uploading.",
            bundle_name
        );
    }

    Ok(())
}

fn json_string_field<'a>(value: &'a Value, field: &str) -> Result<&'a str> {
    value
        .get(field)
        .and_then(|entry| entry.as_str())
        .ok_or_else(|| anyhow!("Response missing string field '{}'", field))
}

fn json_u64_field(value: &Value, field: &str) -> Result<u64> {
    value
        .get(field)
        .and_then(|entry| entry.as_u64())
        .ok_or_else(|| anyhow!("Response missing numeric field '{}'", field))
}

async fn get_more_cdn_upload_urls(
    client: &ApiClient,
    session_id: &str,
    part_numbers: &[u64],
) -> Result<Vec<(u64, String)>> {
    let path = format!("/cdn/upload/{}/urls", session_id);
    let response = client
        .request_json(
            Method::POST,
            &path,
            &[],
            Some(json!({ "partNumbers": part_numbers })),
            true,
        )
        .await?;

    let urls = response
        .get("presignedUrls")
        .and_then(|entry| entry.as_array())
        .ok_or_else(|| anyhow!("Response missing presignedUrls"))?;

    urls.iter()
        .map(|entry| {
            Ok((
                json_u64_field(entry, "partNumber")?,
                json_string_field(entry, "url")?.to_string(),
            ))
        })
        .collect()
}

async fn upload_deliverable_via_cdn_multipart(
    client: &ApiClient,
    cdn_path: &str,
    filename: &str,
    mime: &str,
    content: Vec<u8>,
) -> Result<Value> {
    let initiated = client
        .request_json(
            Method::POST,
            "/cdn/upload/initiate",
            &[],
            Some(json!({
                "path": cdn_path,
                "filename": filename,
                "mimeType": mime,
                "totalSize": content.len(),
            })),
            true,
        )
        .await?;

    let session_id = json_string_field(&initiated, "sessionId")?.to_string();
    let total_parts = json_u64_field(&initiated, "totalParts")?;
    let chunk_size = json_u64_field(&initiated, "chunkSize")? as usize;

    let mut pending_urls = std::collections::BTreeMap::<u64, String>::new();
    if let Some(urls) = initiated.get("presignedUrls").and_then(|entry| entry.as_array()) {
        for entry in urls {
            pending_urls.insert(
                json_u64_field(entry, "partNumber")?,
                json_string_field(entry, "url")?.to_string(),
            );
        }
    }

    for part_number in 1..=total_parts {
        if !pending_urls.contains_key(&part_number) {
            let end = std::cmp::min(total_parts, part_number + (CDN_URL_BATCH_SIZE as u64) - 1);
            let needed_part_numbers = (part_number..=end)
                .filter(|candidate| !pending_urls.contains_key(candidate))
                .collect::<Vec<_>>();
            let more_urls = get_more_cdn_upload_urls(client, &session_id, &needed_part_numbers).await?;
            for (number, url) in more_urls {
                pending_urls.insert(number, url);
            }
        }

        let presigned_url = pending_urls
            .remove(&part_number)
            .ok_or_else(|| anyhow!("Missing presigned URL for part {}", part_number))?;

        let start = ((part_number - 1) as usize) * chunk_size;
        let end = std::cmp::min(start + chunk_size, content.len());
        let etag = client
            .put_bytes_to_url(&presigned_url, content[start..end].to_vec(), mime)
            .await?;

        let mark_part_path = format!("/cdn/upload/{}/part/{}", session_id, part_number);
        client
            .request_json(
                Method::POST,
                &mark_part_path,
                &[],
                Some(json!({ "etag": etag })),
                true,
            )
            .await?;
    }

    let complete_path = format!("/cdn/upload/{}/complete", session_id);
    client
        .request_json(Method::POST, &complete_path, &[], None, true)
        .await
}

#[derive(Debug, Subcommand)]
pub enum AuthCommand {
    /// Open browser OAuth flow and save API key locally
    Login {
        /// Log in as another user via the browser flow. `--delegate` is supported as an alias.
        #[arg(long, alias = "delegate", value_name = "EMAIL")]
        impersonate: Option<String>,
    },
    /// Clear local auth session
    Logout,
    /// Show auth session status
    Status,
    /// Print the stored API key
    Token {
        /// Print only raw token bytes (no JSON wrapper)
        #[arg(long, default_value_t = true)]
        raw: bool,
    },
    /// Configure a profile with an API key directly (headless, no browser)
    Configure {
        /// API key (sk_...)
        #[arg(long)]
        api_key: String,
        /// User name for this profile
        #[arg(long)]
        name: Option<String>,
        /// User email for this profile
        #[arg(long)]
        email: Option<String>,
        /// User role (admin, agent, client)
        #[arg(long)]
        role: Option<String>,
        /// Override base URL
        #[arg(long)]
        base_url: Option<String>,
    },
    /// Manage API keys
    Keys {
        #[command(subcommand)]
        command: AuthKeysCommand,
    },
    /// List all configured profiles
    Profiles,
}

#[derive(Debug, Subcommand)]
pub enum AuthKeysCommand {
    /// List API keys available to the current user
    List,
    /// Revoke an API key by ID
    Revoke {
        /// API key ID
        id: String,
    },
}

#[derive(Debug, Args, Clone)]
pub struct JsonBodyArgs {
    /// Inline JSON payload
    #[arg(long)]
    pub data_json: Option<String>,
    /// Path to JSON payload file
    #[arg(long)]
    pub data_file: Option<PathBuf>,
}

#[derive(Debug, Subcommand)]
pub enum ClientsCommand {
    List,
    Get {
        id: String,
    },
    Create {
        #[command(flatten)]
        body: JsonBodyArgs,
    },
    Update {
        id: String,
        #[command(flatten)]
        body: JsonBodyArgs,
    },
    Delete {
        id: String,
        /// Required safety flag for destructive action
        #[arg(long)]
        yes: bool,
    },
}

#[derive(Debug, Subcommand)]
pub enum UsersCommand {
    List {
        #[arg(long)]
        client: Option<String>,
        #[arg(long)]
        role: Option<String>,
    },
    Get {
        id: String,
    },
    Create {
        #[command(flatten)]
        body: JsonBodyArgs,
    },
    Update {
        id: String,
        #[command(flatten)]
        body: JsonBodyArgs,
    },
    Delete {
        id: String,
        #[arg(long)]
        yes: bool,
    },
}

#[derive(Debug, Subcommand)]
pub enum ProductsPagesCommand {
    List {
        product_id: String,
    },
    Get {
        product_id: String,
        page_id: String,
    },
    Create {
        product_id: String,
        #[command(flatten)]
        body: JsonBodyArgs,
    },
    Update {
        product_id: String,
        page_id: String,
        #[command(flatten)]
        body: JsonBodyArgs,
    },
    Delete {
        product_id: String,
        page_id: String,
        #[arg(long)]
        yes: bool,
    },
}

#[derive(Debug, Subcommand)]
pub enum ProductsCommand {
    List,
    Public,
    Get {
        id: String,
    },
    Create {
        #[command(flatten)]
        body: JsonBodyArgs,
    },
    Update {
        id: String,
        #[command(flatten)]
        body: JsonBodyArgs,
    },
    Delete {
        id: String,
        #[arg(long)]
        yes: bool,
    },
    Pages {
        #[command(subcommand)]
        command: ProductsPagesCommand,
    },
}

#[derive(Debug, Subcommand)]
pub enum LicensesCommand {
    Products,
    Checkout {
        #[arg(long)]
        product_id: String,
        #[arg(long)]
        email: String,
        #[arg(long)]
        success_url: String,
        #[arg(long)]
        cancel_url: String,
    },
    Activate {
        #[arg(long)]
        key: String,
        #[arg(long)]
        hardware_id: String,
        #[arg(long)]
        machine_name: Option<String>,
    },
    Validate {
        #[arg(long)]
        key: String,
        #[arg(long)]
        hardware_id: String,
    },
    Deactivate {
        #[arg(long)]
        key: String,
        #[arg(long)]
        hardware_id: String,
    },
}

#[derive(Debug, Subcommand)]
pub enum InvoicesCommand {
    List {
        #[arg(long)]
        client: Option<String>,
    },
    Has {
        #[arg(long)]
        client: Option<String>,
    },
    Get {
        id: String,
    },
    Create {
        #[command(flatten)]
        body: JsonBodyArgs,
    },
    Update {
        id: String,
        #[command(flatten)]
        body: JsonBodyArgs,
    },
    Delete {
        id: String,
        #[arg(long)]
        yes: bool,
    },
}

#[derive(Debug, Subcommand)]
pub enum DeliverablesCommand {
    List {
        #[arg(long)]
        client: Option<String>,
    },
    Create {
        #[command(flatten)]
        body: JsonBodyArgs,
    },
    /// Sync a local deliverables directory to the server
    Upload {
        /// Optional override for the local deliverables root directory
        #[arg(long)]
        dir: Option<PathBuf>,
    },
    Update {
        id: String,
        #[command(flatten)]
        body: JsonBodyArgs,
    },
    Delete {
        id: String,
        /// Required safety flag for destructive action
        #[arg(long)]
        yes: bool,
    },
}

#[derive(Debug, Args)]
pub struct ApiCommand {
    /// HTTP method (GET, POST, PATCH, DELETE)
    pub method: String,
    /// API path, e.g. /blog/public or /api/blog/public
    pub path: String,
    /// Repeated query params: --query key=value
    #[arg(long = "query", value_name = "key=value")]
    pub query: Vec<String>,
    #[command(flatten)]
    pub body: JsonBodyArgs,
    /// Skip auth header for public endpoints
    #[arg(long)]
    pub no_auth: bool,
}

pub async fn run_auth_keys(
    client: &ApiClient,
    command: AuthKeysCommand,
    compact_json: bool,
) -> Result<()> {
    let value = match command {
        AuthKeysCommand::List => {
            client
                .request_json(Method::GET, "/auth/api-keys", &[], None, true)
                .await?
        }
        AuthKeysCommand::Revoke { id } => {
            let path = format!("/auth/api-keys/{}", id);
            client
                .request_json(Method::DELETE, &path, &[], None, true)
                .await?
        }
    };

    print_value(&value, compact_json)
}

pub async fn run_clients(
    client: &ApiClient,
    command: ClientsCommand,
    compact_json: bool,
) -> Result<()> {
    let value = match command {
        ClientsCommand::List => {
            client
                .request_json(Method::GET, "/clients", &[], None, true)
                .await?
        }
        ClientsCommand::Get { id } => {
            let path = format!("/clients/{}", id);
            client
                .request_json(Method::GET, &path, &[], None, true)
                .await?
        }
        ClientsCommand::Create { body } => {
            let payload = required_body(&body)?;
            client
                .request_json(Method::POST, "/clients", &[], Some(payload), true)
                .await?
        }
        ClientsCommand::Update { id, body } => {
            let payload = required_body(&body)?;
            let path = format!("/clients/{}", id);
            client
                .request_json(Method::PATCH, &path, &[], Some(payload), true)
                .await?
        }
        ClientsCommand::Delete { id, yes } => {
            if !yes {
                bail!("Refusing to delete without --yes");
            }
            let path = format!("/clients/{}", id);
            client
                .request_json(Method::DELETE, &path, &[], None, true)
                .await?
        }
    };

    print_value(&value, compact_json)
}

pub async fn run_users(
    client: &ApiClient,
    cfg: &StoredConfig,
    command: UsersCommand,
    compact_json: bool,
) -> Result<()> {
    let value = match command {
        UsersCommand::List {
            client: client_ref,
            role,
        } => {
            let mut query = Vec::new();
            if let Some(v) = client_ref {
                let resolved = resolve_client_id(client, cfg, Some(v)).await?;
                query.push(("clientId".to_string(), resolved));
            }
            if let Some(v) = role {
                query.push(("role".to_string(), v));
            }
            client
                .request_json(Method::GET, "/users", &query, None, true)
                .await?
        }
        UsersCommand::Get { id } => {
            let path = format!("/users/{}", id);
            client
                .request_json(Method::GET, &path, &[], None, true)
                .await?
        }
        UsersCommand::Create { body } => {
            let payload = required_body(&body)?;
            client
                .request_json(Method::POST, "/users", &[], Some(payload), true)
                .await?
        }
        UsersCommand::Update { id, body } => {
            let payload = required_body(&body)?;
            let path = format!("/users/{}", id);
            client
                .request_json(Method::PATCH, &path, &[], Some(payload), true)
                .await?
        }
        UsersCommand::Delete { id, yes } => {
            if !yes {
                bail!("Refusing to delete without --yes");
            }
            let path = format!("/users/{}", id);
            client
                .request_json(Method::DELETE, &path, &[], None, true)
                .await?
        }
    };

    print_value(&value, compact_json)
}

pub async fn run_products(
    client: &ApiClient,
    command: ProductsCommand,
    compact_json: bool,
) -> Result<()> {
    let value = match command {
        ProductsCommand::List => {
            client
                .request_json(Method::GET, "/products", &[], None, true)
                .await?
        }
        ProductsCommand::Public => {
            client
                .request_json(Method::GET, "/products/public", &[], None, false)
                .await?
        }
        ProductsCommand::Get { id } => {
            let path = format!("/products/{}", id);
            client
                .request_json(Method::GET, &path, &[], None, true)
                .await?
        }
        ProductsCommand::Create { body } => {
            let payload = required_body(&body)?;
            client
                .request_json(Method::POST, "/products", &[], Some(payload), true)
                .await?
        }
        ProductsCommand::Update { id, body } => {
            let payload = required_body(&body)?;
            let path = format!("/products/{}", id);
            client
                .request_json(Method::PATCH, &path, &[], Some(payload), true)
                .await?
        }
        ProductsCommand::Delete { id, yes } => {
            if !yes {
                bail!("Refusing to delete without --yes");
            }
            let path = format!("/products/{}", id);
            client
                .request_json(Method::DELETE, &path, &[], None, true)
                .await?
        }
        ProductsCommand::Pages { command } => run_product_pages(client, command).await?,
    };

    print_value(&value, compact_json)
}

async fn run_product_pages(client: &ApiClient, command: ProductsPagesCommand) -> Result<Value> {
    let value = match command {
        ProductsPagesCommand::List { product_id } => {
            let path = format!("/products/{}/pages", product_id);
            client
                .request_json(Method::GET, &path, &[], None, true)
                .await?
        }
        ProductsPagesCommand::Get {
            product_id,
            page_id,
        } => {
            let path = format!("/products/{}/pages/{}", product_id, page_id);
            client
                .request_json(Method::GET, &path, &[], None, true)
                .await?
        }
        ProductsPagesCommand::Create { product_id, body } => {
            let payload = required_body(&body)?;
            let path = format!("/products/{}/pages", product_id);
            client
                .request_json(Method::POST, &path, &[], Some(payload), true)
                .await?
        }
        ProductsPagesCommand::Update {
            product_id,
            page_id,
            body,
        } => {
            let payload = required_body(&body)?;
            let path = format!("/products/{}/pages/{}", product_id, page_id);
            client
                .request_json(Method::PATCH, &path, &[], Some(payload), true)
                .await?
        }
        ProductsPagesCommand::Delete {
            product_id,
            page_id,
            yes,
        } => {
            if !yes {
                bail!("Refusing to delete without --yes");
            }
            let path = format!("/products/{}/pages/{}", product_id, page_id);
            client
                .request_json(Method::DELETE, &path, &[], None, true)
                .await?
        }
    };

    Ok(value)
}

pub async fn run_licenses(
    client: &ApiClient,
    _cfg: &StoredConfig,
    command: LicensesCommand,
    compact_json: bool,
) -> Result<()> {
    let as_items = matches!(&command, LicensesCommand::Products);
    let value = match command {
        LicensesCommand::Products => {
            client
                .request_json(Method::GET, "/licenses/products", &[], None, false)
                .await?
        }
        LicensesCommand::Checkout {
            product_id,
            email,
            success_url,
            cancel_url,
        } => {
            let body = json!({
                "productId": product_id,
                "email": email,
                "successUrl": success_url,
                "cancelUrl": cancel_url
            });
            client
                .request_json(Method::POST, "/licenses/checkout", &[], Some(body), false)
                .await?
        }
        LicensesCommand::Activate {
            key,
            hardware_id,
            machine_name,
        } => {
            let body = json!({
                "key": key,
                "hardwareId": hardware_id,
                "machineName": machine_name
            });
            client
                .request_json(Method::POST, "/licenses/activate", &[], Some(body), false)
                .await?
        }
        LicensesCommand::Validate { key, hardware_id } => {
            let body = json!({ "key": key, "hardwareId": hardware_id });
            client
                .request_json(Method::POST, "/licenses/validate", &[], Some(body), false)
                .await?
        }
        LicensesCommand::Deactivate { key, hardware_id } => {
            let body = json!({ "key": key, "hardwareId": hardware_id });
            client
                .request_json(Method::POST, "/licenses/deactivate", &[], Some(body), false)
                .await?
        }
    };

    if as_items {
        if let Some(rows) = value.as_array() {
            let mut items = Vec::with_capacity(rows.len());
            for row in rows {
                let name = row
                    .get("name")
                    .and_then(|v| v.as_str())
                    .or_else(|| row.get("productId").and_then(|v| v.as_str()))
                    .unwrap_or("License")
                    .to_string();

                let product_id = row.get("productId").and_then(|v| v.as_str()).unwrap_or("-");
                let duration = row
                    .get("licenseDurationDays")
                    .and_then(|v| v.as_i64())
                    .unwrap_or(365);
                let trial = row
                    .get("trialDurationDays")
                    .and_then(|v| v.as_i64())
                    .unwrap_or(0);
                let description = if trial > 0 {
                    format!(
                        "Product ID: {}. {}-day license with {}-day trial.",
                        product_id, duration, trial
                    )
                } else {
                    format!("Product ID: {}. {}-day license.", product_id, duration)
                };

                let raw_link = row
                    .get("purchaseUrl")
                    .and_then(|v| v.as_str())
                    .unwrap_or("/pricing/");
                let url = to_absolute_url(&client.base_url, raw_link);

                items.push(json!({
                    "name": name,
                    "description": description,
                    "link": {
                        "type": "authenticated_page",
                        "url": url
                    }
                }));
            }
            return print_value(&Value::Array(items), compact_json);
        }
    }

    print_value(&value, compact_json)
}

pub async fn run_invoices(
    client: &ApiClient,
    cfg: &StoredConfig,
    command: InvoicesCommand,
    compact_json: bool,
) -> Result<()> {
    let as_items = matches!(&command, InvoicesCommand::List { .. });
    let value = match command {
        InvoicesCommand::List { client: client_ref } => {
            let resolved_client_id = resolve_client_id(client, cfg, client_ref).await?;
            client
                .request_json(
                    Method::GET,
                    "/invoices",
                    &[("clientId".to_string(), resolved_client_id)],
                    None,
                    true,
                )
                .await?
        }
        InvoicesCommand::Has { client: client_ref } => {
            let resolved_client_id = resolve_client_id(client, cfg, client_ref).await?;
            client
                .request_json(
                    Method::GET,
                    "/invoices/has-invoices",
                    &[("clientId".to_string(), resolved_client_id)],
                    None,
                    true,
                )
                .await?
        }
        InvoicesCommand::Get { id } => {
            let path = format!("/invoices/{}", id);
            client
                .request_json(Method::GET, &path, &[], None, true)
                .await?
        }
        InvoicesCommand::Create { body } => {
            ensure_admin(cfg)?;
            let payload = required_body(&body)?;
            client
                .request_json(Method::POST, "/invoices", &[], Some(payload), true)
                .await?
        }
        InvoicesCommand::Update { id, body } => {
            ensure_admin(cfg)?;
            let payload = required_body(&body)?;
            let path = format!("/invoices/{}", id);
            client
                .request_json(Method::PATCH, &path, &[], Some(payload), true)
                .await?
        }
        InvoicesCommand::Delete { id, yes } => {
            ensure_admin(cfg)?;
            if !yes {
                bail!("Refusing to delete without --yes");
            }
            let path = format!("/invoices/{}", id);
            client
                .request_json(Method::DELETE, &path, &[], None, true)
                .await?
        }
    };

    if as_items {
        if let Some(rows) = value.as_array() {
            let mut items = Vec::with_capacity(rows.len());
            for row in rows {
                let id = row
                    .get("_id")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();
                let invoice_date = row
                    .get("invoiceDate")
                    .and_then(|v| v.as_str())
                    .unwrap_or("unknown date");
                let status = row
                    .get("status")
                    .and_then(|v| v.as_str())
                    .unwrap_or("unknown");
                let period_start = row
                    .get("periodStart")
                    .and_then(|v| v.as_str())
                    .unwrap_or("?");
                let period_end = row.get("periodEnd").and_then(|v| v.as_str()).unwrap_or("?");
                let total_hours = row
                    .get("totalHours")
                    .and_then(|v| v.as_f64())
                    .unwrap_or(0.0);
                let name = if id.is_empty() {
                    format!("Invoice {}", invoice_date)
                } else {
                    format!("Invoice {} ({})", invoice_date, id)
                };
                let description = format!(
                    "Status: {}. Period: {} to {}. Total hours: {}.",
                    status, period_start, period_end, total_hours
                );
                let link = if id.is_empty() {
                    to_absolute_url(&client.base_url, "/consulting/invoices")
                } else {
                    to_absolute_url(&client.base_url, &format!("/consulting/invoices/{}", id))
                };

                items.push(json!({
                    "name": name,
                    "description": description,
                    "link": {
                        "type": "authenticated_page",
                        "url": link
                    }
                }));
            }
            return print_value(&Value::Array(items), compact_json);
        }
    }

    print_value(&value, compact_json)
}

pub async fn run_deliverables(
    client: &ApiClient,
    cfg: &StoredConfig,
    command: DeliverablesCommand,
    compact_json: bool,
) -> Result<()> {
    let as_items = matches!(&command, DeliverablesCommand::List { .. });
    let value = match command {
        DeliverablesCommand::List { client: client_ref } => {
            let resolved_client_id = resolve_client_id(client, cfg, client_ref).await?;
            client
                .request_json(
                    Method::GET,
                    "/deliverables",
                    &[("clientId".to_string(), resolved_client_id)],
                    None,
                    true,
                )
                .await?
        }
        DeliverablesCommand::Create { body } => {
            ensure_admin(cfg)?;
            let payload = required_body(&body)?;
            client
                .request_json(Method::POST, "/deliverables", &[], Some(payload), true)
                .await?
        }
        DeliverablesCommand::Upload { dir } => {
            ensure_admin(cfg)?;

            let root_dir = match dir {
                Some(d) => d.clone(),
                None => {
                    if let Some(cfg_dir) = &cfg.deliverables_dir {
                        let path = PathBuf::from(cfg_dir);
                        if path.starts_with("~/") {
                            // Expand tilde
                            let home = dirs::home_dir().ok_or_else(|| {
                                anyhow!("Could not determine home directory for ~ expansion")
                            })?;
                            home.join(path.strip_prefix("~/").unwrap())
                        } else {
                            path
                        }
                    } else {
                        bail!("No deliverables directory specified. Use --dir or configure one via `stoked auth configure --deliverables-dir <path>`");
                    }
                }
            };

            if !root_dir.is_dir() {
                bail!("'{}' is not a valid directory", root_dir.display());
            }

            println!("Syncing deliverables from: {}", root_dir.display());

            // 1. Fetch all clients so we can map slug (folder name) to client ID
            let clients_response = client
                .request_json(Method::GET, "/clients", &[], None, true)
                .await
                .context("Failed to fetch clients before syncing deliverables")?;
            let clients = clients_response
                .as_array()
                .ok_or_else(|| anyhow!("Expected array of clients"))?;

            // 2. Iterate over the root directory (first level = client slugs)
            for entry in std::fs::read_dir(&root_dir)? {
                let entry = entry?;
                if !entry.file_type()?.is_dir() {
                    continue; // Skip stray files at the root
                }

                let client_slug = entry.file_name().to_string_lossy().to_string();
                let client_dir = entry.path();

                // Find matching client
                let matched_client = clients.iter().find(|c| {
                    c.get("slug").and_then(|s| s.as_str()) == Some(&client_slug)
                        || c.get("name")
                            .and_then(|n| n.as_str())
                            .map(|n| n.to_lowercase())
                            == Some(client_slug.to_lowercase())
                });

                let client_id = match matched_client {
                    Some(c) => c.get("_id").and_then(|id| id.as_str()).unwrap().to_string(),
                    None => {
                        println!(
                            "⚠️  Skipping folder '{}': No matching client found in database.",
                            client_slug
                        );
                        continue;
                    }
                };
                let client_slug = matched_client
                    .and_then(|c| c.get("slug"))
                    .and_then(|slug| slug.as_str())
                    .unwrap_or(&client_slug)
                    .to_string();

                println!(
                    "\n📦 Processing client: {} (ID: {})",
                    client_slug, client_id
                );

                // 3. Iterate over the client directory (second level = bundles/zips)
                for bundle_entry in std::fs::read_dir(&client_dir)? {
                    let bundle_entry = bundle_entry?;
                    let bundle_name = bundle_entry.file_name().to_string_lossy().to_string();
                    let bundle_path = bundle_entry.path();
                    let is_dir = bundle_entry.file_type()?.is_dir();

                    let bundle_id = bundle_name
                        .replace(".zip", "")
                        .chars()
                        .map(|c| if c.is_ascii_alphanumeric() { c } else { '-' })
                        .collect::<String>();
                    // We generate a clean title from the folder name
                    let title = bundle_name.replace(".zip", "").replace("-", " ");
                    let type_val;
                    let mut index_file = "index.html".to_string();

                    let mut files_to_upload = Vec::new();

                    if is_dir {
                        // Directory bundle (HTML presentation)
                        type_val = "html";
                        let walker = walkdir::WalkDir::new(&bundle_path)
                            .into_iter()
                            .filter_map(|e| e.ok());
                        for file_entry in walker {
                            if !file_entry.file_type().is_file() {
                                continue;
                            }
                            let full_path = file_entry.path().to_path_buf();
                            let rel_path = full_path
                                .strip_prefix(&bundle_path)?
                                .to_str()
                                .ok_or_else(|| anyhow!("Invalid path encoding"))?
                                .to_string();
                            files_to_upload.push((full_path, rel_path));
                        }
                    } else if bundle_name.ends_with(".zip") {
                        // Single zip file download
                        type_val = "download";
                        index_file = bundle_name.clone();
                        files_to_upload.push((bundle_path.clone(), bundle_name.clone()));
                    } else {
                        // Skip stray non-zip files in the client root
                        continue;
                    }

                    println!(
                        "  🚀 Uploading bundle: {} ({} files)",
                        bundle_name,
                        files_to_upload.len()
                    );
                    let has_index_file = files_to_upload
                        .iter()
                        .any(|(_, rel_path)| rel_path == &index_file);
                    if !has_index_file {
                        bail!(
                            "Bundle '{}' for client '{}' is missing its entry file '{}'",
                            bundle_name,
                            client_slug,
                            index_file
                        );
                    }
                    if is_dir {
                        validate_html_deliverable_bundle(
                            &bundle_name,
                            &bundle_path,
                            &files_to_upload,
                            &index_file,
                        )?;
                    }

                    let mut uploaded_index_url: Option<String> = None;

                    for (full_path, rel_path) in files_to_upload {
                        let content = std::fs::read(&full_path)?;
                        let mime = mime_guess::from_path(&full_path)
                            .first_or_octet_stream()
                            .to_string();

                        let query = vec![
                            ("clientId".to_string(), client_id.clone()),
                            ("clientSlug".to_string(), client_slug.clone()),
                            ("bundleId".to_string(), bundle_id.clone()),
                            ("filePath".to_string(), rel_path.clone()),
                        ];

                        print!("    Uploading {}... ", rel_path);
                        use std::io::Write;
                        std::io::stdout().flush()?;

                        let upload_response = if should_use_cdn_multipart_upload(&client, content.len()) {
                            let cdn_path = build_deliverable_cdn_path(&client_slug, &bundle_id, &rel_path)?;
                            upload_deliverable_via_cdn_multipart(
                                &client,
                                &cdn_path,
                                &rel_path,
                                &mime,
                                content,
                            )
                            .await
                        } else {
                            client
                                .request_bytes(
                                    Method::POST,
                                    "/deliverables/upload-file",
                                    &query,
                                    content,
                                    &mime,
                                    true,
                                )
                                .await
                        }
                        .with_context(|| {
                            format!(
                                "Failed uploading deliverable file '{}' for client '{}' bundle '{}'",
                                rel_path, client_slug, bundle_name
                            )
                        })?;
                        if rel_path == index_file {
                            uploaded_index_url = upload_response
                                .get("url")
                                .and_then(|value| value.as_str())
                                .map(|value| value.to_string());
                        }
                        println!("Done.");
                    }

                    let url = uploaded_index_url.ok_or_else(|| {
                        anyhow!(
                            "Upload for bundle '{}' did not return a URL for '{}'",
                            bundle_name,
                            index_file
                        )
                    })?;

                    // Auto-increment version: query existing deliverables for this client
                    // and find the highest version number for this title
                    let existing = client
                        .request_json(
                            Method::GET,
                            "/deliverables",
                            &[("clientId".to_string(), client_id.clone())],
                            None,
                            true,
                        )
                        .await
                        .with_context(|| {
                            format!(
                                "Failed loading existing deliverables for client '{}' before versioning bundle '{}'",
                                client_slug, bundle_name
                            )
                        })?;
                    let title_lower = title.to_lowercase();
                    let max_version = existing
                        .as_array()
                        .map(|arr| {
                            arr.iter()
                                .filter(|d| {
                                    d.get("title")
                                        .and_then(|t| t.as_str())
                                        .map(|t| t.to_lowercase() == title_lower)
                                        .unwrap_or(false)
                                })
                                .filter_map(|d| {
                                    d.get("version")
                                        .and_then(|v| v.as_str())
                                        .and_then(|v| v.trim_start_matches('v').parse::<u32>().ok())
                                })
                                .max()
                        })
                        .flatten()
                        .unwrap_or(0);
                    let next_version = format!("{}", max_version + 1);

                    let create_payload = json!({
                        "clientId": client_id,
                        "title": title,
                        "type": type_val,
                        "url": url,
                        "version": next_version
                    });

                    println!("  ✅ Creating database entry for {}", title);
                    // Use a PATCH or custom upsert here in the future if you want to avoid duplicates.
                    // For now, it will create a new entry on every sync.
                    client
                        .request_json(
                            Method::POST,
                            "/deliverables",
                            &[],
                            Some(create_payload),
                            true,
                        )
                        .await
                        .with_context(|| {
                            format!(
                                "Failed creating deliverable entry for client '{}' bundle '{}'",
                                client_slug, bundle_name
                            )
                        })?;
                }
            }

            return print_value(&json!({ "status": "Sync complete" }), compact_json);
        }
        DeliverablesCommand::Update { id, body } => {
            ensure_admin(cfg)?;
            let payload = required_body(&body)?;
            let path = format!("/deliverables/{}", id);
            client
                .request_json(Method::PATCH, &path, &[], Some(payload), true)
                .await?
        }
        DeliverablesCommand::Delete { id, yes } => {
            ensure_admin(cfg)?;
            if !yes {
                bail!("Refusing to delete without --yes");
            }
            let path = format!("/deliverables/{}", id);
            client
                .request_json(Method::DELETE, &path, &[], None, true)
                .await?
        }
    };

    if as_items {
        if let Some(rows) = value.as_array() {
            let mut items = Vec::with_capacity(rows.len());
            for row in rows {
                let name = row
                    .get("title")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Deliverable")
                    .to_string();
                let deliverable_type = row.get("type").and_then(|v| v.as_str()).unwrap_or("link");
                let version = row.get("version").and_then(|v| v.as_str()).unwrap_or("");
                let raw_url = row.get("url").and_then(|v| v.as_str()).unwrap_or("/");
                let link_type = if deliverable_type == "download" {
                    "download"
                } else {
                    "authenticated_page"
                };
                let description = if version.is_empty() {
                    format!("Type: {}.", deliverable_type)
                } else {
                    format!("Type: {}. Version: {}.", deliverable_type, version)
                };
                let url = to_absolute_url(&client.base_url, raw_url);

                items.push(json!({
                    "name": name,
                    "description": description,
                    "link": {
                        "type": link_type,
                        "url": url
                    }
                }));
            }
            return print_value(&Value::Array(items), compact_json);
        }
    }

    print_value(&value, compact_json)
}

pub async fn run_api(client: &ApiClient, command: ApiCommand, compact_json: bool) -> Result<()> {
    let method = parse_method(&command.method)?;
    let query = parse_kv_pairs(&command.query)?;
    let body = parse_optional_json_body(
        command.body.data_json.as_ref(),
        command.body.data_file.as_ref(),
    )?;

    let value = client
        .request_json(method, &command.path, &query, body, !command.no_auth)
        .await?;

    print_value(&value, compact_json)
}

fn ensure_admin(cfg: &StoredConfig) -> Result<()> {
    if cfg.is_admin() {
        return Ok(());
    }

    bail!(
        "Admin-only command. Non-admin users can only run: `stoked licenses products`, `stoked invoices list/get/has`, and `stoked deliverables list`."
    )
}

async fn resolve_client_id(
    client: &ApiClient,
    cfg: &StoredConfig,
    requested: Option<String>,
) -> Result<String> {
    if cfg.is_admin() {
        let identifier =
            requested.ok_or_else(|| anyhow!("`--client` is required for admin users."))?;

        // If it's already a valid hex ID (24 chars), assume it's an ID
        if identifier.len() == 24 && identifier.chars().all(|c| c.is_ascii_hexdigit()) {
            return Ok(identifier);
        }

        // Otherwise, fetch all clients and find by name/slug
        let clients_response = client
            .request_json(Method::GET, "/clients", &[], None, true)
            .await?;
        let clients = clients_response
            .as_array()
            .ok_or_else(|| anyhow!("Expected array of clients"))?;

        let matched = clients.iter().find(|c| {
            c.get("slug").and_then(|s| s.as_str()) == Some(&identifier)
                || c.get("name")
                    .and_then(|n| n.as_str())
                    .map(|n| n.to_lowercase())
                    == Some(identifier.to_lowercase())
        });

        return match matched {
            Some(c) => Ok(c.get("_id").and_then(|id| id.as_str()).unwrap().to_string()),
            None => bail!("Client '{}' not found", identifier),
        };
    }

    let own_client_id = cfg.client_id.as_ref().ok_or_else(|| {
        anyhow!("Client ID is missing from local auth session. Run `stoked auth login` again.")
    })?;

    if let Some(explicit) = requested {
        // Even for non-admins, if they provide a name, resolve it to verify it's theirs
        if explicit.len() == 24 && explicit.chars().all(|c| c.is_ascii_hexdigit()) {
            if explicit != *own_client_id {
                bail!("Non-admin users can only access their own client records.");
            }
            return Ok(explicit);
        }

        let clients_response = client
            .request_json(Method::GET, "/clients", &[], None, true)
            .await?;
        let clients = clients_response
            .as_array()
            .ok_or_else(|| anyhow!("Expected array of clients"))?;

        let matched = clients.iter().find(|c| {
            c.get("slug").and_then(|s| s.as_str()) == Some(&explicit)
                || c.get("name")
                    .and_then(|n| n.as_str())
                    .map(|n| n.to_lowercase())
                    == Some(explicit.to_lowercase())
        });

        match matched {
            Some(c) => {
                let id = c.get("_id").and_then(|id| id.as_str()).unwrap().to_string();
                if id != *own_client_id {
                    bail!("Non-admin users can only access their own client records.");
                }
                return Ok(id);
            }
            None => bail!("Client '{}' not found", explicit),
        }
    }

    Ok(own_client_id.clone())
}

fn to_absolute_url(base_url: &str, raw: &str) -> String {
    if raw.starts_with("http://") || raw.starts_with("https://") {
        return raw.to_string();
    }

    let trimmed_base = base_url.trim_end_matches('/');
    let normalized_raw = if raw.starts_with('/') {
        raw.to_string()
    } else {
        format!("/{}", raw)
    };

    format!("{}{}", trimmed_base, normalized_raw)
}

fn parse_method(raw: &str) -> Result<Method> {
    Method::from_bytes(raw.trim().to_uppercase().as_bytes())
        .map_err(|_| anyhow!("Unsupported HTTP method: {}", raw))
}

fn required_body(body: &JsonBodyArgs) -> Result<Value> {
    parse_optional_json_body(body.data_json.as_ref(), body.data_file.as_ref())?
        .ok_or_else(|| anyhow!("Missing payload. Provide --data-json or --data-file."))
}
