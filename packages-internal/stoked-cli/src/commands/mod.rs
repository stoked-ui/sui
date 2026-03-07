pub mod blog;

use crate::client::{parse_kv_pairs, parse_optional_json_body, print_value, ApiClient};
use crate::config::StoredConfig;
use anyhow::{anyhow, bail, Result};
use clap::{Args, Subcommand};
use reqwest::Method;
use serde_json::{json, Value};
use std::path::PathBuf;

#[derive(Debug, Subcommand)]
pub enum AuthCommand {
    /// Open browser OAuth flow and save API key locally
    Login,
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
        client_id: Option<String>,
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
        client_id: Option<String>,
    },
    Has {
        #[arg(long)]
        client_id: Option<String>,
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
        client_id: Option<String>,
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
    command: UsersCommand,
    compact_json: bool,
) -> Result<()> {
    let value = match command {
        UsersCommand::List { client_id, role } => {
            let mut query = Vec::new();
            if let Some(v) = client_id {
                query.push(("clientId".to_string(), v));
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
        InvoicesCommand::List { client_id } => {
            let resolved_client_id = resolve_client_id(cfg, client_id)?;
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
        InvoicesCommand::Has { client_id } => {
            let resolved_client_id = resolve_client_id(cfg, client_id)?;
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
        DeliverablesCommand::List { client_id } => {
            let resolved_client_id = resolve_client_id(cfg, client_id)?;
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

fn resolve_client_id(cfg: &StoredConfig, requested: Option<String>) -> Result<String> {
    if cfg.is_admin() {
        return requested.ok_or_else(|| anyhow!("`--client-id` is required for admin users."));
    }

    let own_client_id = cfg.client_id.as_ref().ok_or_else(|| {
        anyhow!("Client ID is missing from local auth session. Run `stoked auth login` again.")
    })?;

    if let Some(explicit) = requested {
        if explicit != *own_client_id {
            bail!("Non-admin users can only access their own client records.");
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
