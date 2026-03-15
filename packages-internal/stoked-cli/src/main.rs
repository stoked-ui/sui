mod auth;
mod client;
mod commands;
mod config;

use anyhow::{bail, Result};
use clap::{Parser, Subcommand};
use commands::blog::BlogCommand;
use commands::{
    run_api, run_auth_keys, run_clients, run_deliverables, run_invoices, run_licenses,
    run_products, run_users, ApiCommand, AuthCommand, ClientsCommand, DeliverablesCommand,
    InvoicesCommand, LicensesCommand, ProductsCommand, UsersCommand,
};

use crate::client::{print_value, ApiClient};
use crate::config::{
    list_profiles, load_config_for_profile, normalize_base_url, resolve_profile,
    save_config_for_profile, StoredConfig, LOCAL_DEV_BASE_URL,
};

#[derive(Debug, Parser)]
#[command(name = "stoked")]
#[command(about = "CLI for Stoked Next.js APIs", version)]
struct Cli {
    /// Override API base URL (default: STOKED_BASE_URL env, then saved config, then https://stoked-ui.com)
    #[arg(long, global = true)]
    base_url: Option<String>,

    /// Use local dev server (http://localhost:5199)
    #[arg(long, global = true)]
    dev: bool,

    /// Named profile for auth credentials (default: STOKED_PROFILE env, then "default")
    #[arg(long, short = 'p', global = true)]
    profile: Option<String>,

    /// Print compact JSON (default is pretty JSON)
    #[arg(long, global = true)]
    json: bool,

    #[command(subcommand)]
    command: TopCommand,
}

#[derive(Debug, Subcommand)]
enum TopCommand {
    /// Authentication and profile management
    Auth {
        #[command(subcommand)]
        command: AuthCommand,
    },
    /// Manage local CLI settings (e.g. stoked set deliverables-dir ~/work/deliverables)
    Set {
        /// Setting name
        key: String,
        /// Setting value
        value: String,
    },
    /// View a local CLI setting
    Get {
        /// Setting name
        key: String,
    },
    /// Blog management
    Blog {
        #[command(subcommand)]
        command: BlogCommand,
    },
    /// Client APIs
    Clients {
        #[command(subcommand)]
        command: ClientsCommand,
    },
    /// User APIs
    Users {
        #[command(subcommand)]
        command: UsersCommand,
    },
    /// Product + product page APIs
    Products {
        #[command(subcommand)]
        command: ProductsCommand,
    },
    /// License APIs
    Licenses {
        #[command(subcommand)]
        command: LicensesCommand,
    },
    /// Invoice APIs
    Invoices {
        #[command(subcommand)]
        command: InvoicesCommand,
    },
    /// Deliverable APIs
    Deliverables {
        #[command(subcommand)]
        command: DeliverablesCommand,
    },
    /// Generic API passthrough for any Next.js route
    Api(ApiCommand),
}

#[tokio::main]
async fn main() {
    if let Err(err) = run().await {
        eprintln!("Error: {:#}", err);
        std::process::exit(1);
    }
}

const DEV_BASE_URL: &str = LOCAL_DEV_BASE_URL;

async fn run() -> Result<()> {
    let cli = Cli::parse();
    let profile = resolve_profile(cli.profile.as_deref());
    // --dev flag overrides base_url to local dev server
    let base_url = if cli.dev {
        Some(DEV_BASE_URL.to_string())
    } else {
        cli.base_url
    };

    match cli.command {
        TopCommand::Auth { command } => match command {
            AuthCommand::Login { impersonate } => {
                auth::login(base_url, &profile, cli.json, impersonate).await
            }
            AuthCommand::Logout => auth::logout(base_url, &profile, cli.json),
            AuthCommand::Status => auth::status(base_url, &profile, cli.json).await,
            AuthCommand::Token { raw } => auth::token(base_url, &profile, raw),
            AuthCommand::Configure {
                api_key,
                name,
                email,
                role,
                base_url: cfg_base_url,
            } => {
                let mut cfg = load_config_for_profile(&profile)?;
                let auth_base_url = normalize_base_url(
                    &cfg_base_url
                        .clone()
                        .or(base_url.clone())
                        .unwrap_or_else(|| cfg.default_base_url()),
                );
                if !cli.dev && auth_base_url == DEV_BASE_URL {
                    bail!("Use `--dev` instead of configuring localhost as the default base URL.");
                }
                if let Some(explicit_base_url) = cfg_base_url {
                    cfg.base_url = Some(normalize_base_url(&explicit_base_url));
                }
                cfg.set_auth_for_base_url(
                    &auth_base_url,
                    api_key,
                    email.clone(),
                    name.clone(),
                    role.clone(),
                    None,
                );
                save_config_for_profile(&cfg, &profile)?;
                let active_cfg = cfg.active_view(&auth_base_url);
                let result = serde_json::json!({
                    "configured": true,
                    "profile": profile,
                    "base_url": auth_base_url,
                    "email": active_cfg.email,
                    "name": active_cfg.name,
                    "role": active_cfg.role,
                    "message": format!("Profile '{}' configured successfully", profile)
                });
                print_value(&result, cli.json)
            }
            AuthCommand::Keys { command } => {
                let (client, _) = build_client(base_url, &profile)?;
                run_auth_keys(&client, command, cli.json).await
            }
            AuthCommand::Profiles => {
                let profiles = list_profiles()?;
                let result = serde_json::json!({
                    "active": profile,
                    "profiles": profiles,
                });
                print_value(&result, cli.json)
            }
        },
        TopCommand::Set { key, value } => {
            let mut cfg = load_config_for_profile(&profile)?;
            match key.as_str() {
                "deliverables-dir" | "deliverables_dir" => {
                    cfg.deliverables_dir = Some(value.clone());
                }
                "base-url" | "base_url" => {
                    let normalized = normalize_base_url(&value);
                    if !cli.dev && normalized == DEV_BASE_URL {
                        bail!("Use `--dev` instead of saving localhost as the default base URL.");
                    }
                    cfg.base_url = Some(value.clone());
                }
                _ => bail!("Unknown setting key: {}", key),
            }
            save_config_for_profile(&cfg, &profile)?;
            let result = serde_json::json!({ "key": key, "value": value, "saved": true });
            print_value(&result, cli.json)
        }
        TopCommand::Get { key } => {
            let cfg = load_config_for_profile(&profile)?;
            let active_base_url =
                normalize_base_url(&base_url.unwrap_or_else(|| cfg.default_base_url()));
            let active_cfg = cfg.active_view(&active_base_url);
            let value = match key.as_str() {
                "deliverables-dir" | "deliverables_dir" => active_cfg.deliverables_dir.clone(),
                "base-url" | "base_url" => Some(active_base_url),
                "email" => active_cfg.email.clone(),
                "name" => active_cfg.name.clone(),
                "role" => active_cfg.role.clone(),
                _ => bail!("Unknown setting key: {}", key),
            };
            let result = serde_json::json!({ "key": key, "value": value });
            print_value(&result, cli.json)
        }
        TopCommand::Blog { command } => {
            let (client, cfg) = build_client(base_url, &profile)?;
            ensure_admin_or_agent(&cfg, "blog commands")?;
            commands::blog::run_blog(&client, &cfg, command, cli.json).await
        }
        TopCommand::Clients { command } => {
            let (client, cfg) = build_client(base_url, &profile)?;
            ensure_admin(&cfg, "client commands")?;
            run_clients(&client, command, cli.json).await
        }
        TopCommand::Users { command } => {
            let (client, cfg) = build_client(base_url, &profile)?;
            ensure_admin(&cfg, "user commands")?;
            run_users(&client, &cfg, command, cli.json).await
        }
        TopCommand::Products { command } => {
            let (client, cfg) = build_client(base_url, &profile)?;
            ensure_admin(&cfg, "product commands")?;
            run_products(&client, command, cli.json).await
        }
        TopCommand::Licenses { command } => {
            let (client, cfg) = build_client(base_url, &profile)?;
            if !cfg.is_admin() && !matches!(&command, LicensesCommand::Products) {
                anyhow::bail!("{}", non_admin_permissions_message());
            }
            run_licenses(&client, &cfg, command, cli.json).await
        }
        TopCommand::Invoices { command } => {
            let (client, cfg) = build_client(base_url, &profile)?;
            run_invoices(&client, &cfg, command, cli.json).await
        }
        TopCommand::Deliverables { command } => {
            let (client, cfg) = build_client(base_url, &profile)?;
            run_deliverables(&client, &cfg, command, cli.json).await
        }
        TopCommand::Api(command) => {
            let (client, cfg) = build_client(base_url, &profile)?;
            ensure_admin(&cfg, "api passthrough")?;
            run_api(&client, command, cli.json).await
        }
    }
}

fn build_client(base_override: Option<String>, profile: &str) -> Result<(ApiClient, StoredConfig)> {
    let cfg = load_config_for_profile(profile)?;
    let base_url = normalize_base_url(&base_override.unwrap_or_else(|| cfg.default_base_url()));
    let active_cfg = cfg.active_view(&base_url);
    let client = ApiClient::new(base_url, active_cfg.api_key.clone())?;
    Ok((client, active_cfg))
}

fn ensure_admin(cfg: &StoredConfig, action: &str) -> Result<()> {
    if cfg.is_admin() {
        return Ok(());
    }
    anyhow::bail!(
        "{} are admin-only. {}",
        action,
        non_admin_permissions_message()
    )
}

fn ensure_admin_or_agent(cfg: &StoredConfig, action: &str) -> Result<()> {
    if cfg.is_admin() || matches!(cfg.role_str(), Some("agent")) {
        return Ok(());
    }
    anyhow::bail!(
        "{} require admin or agent role. {}",
        action,
        non_admin_permissions_message()
    )
}

fn non_admin_permissions_message() -> &'static str {
    "Non-admin users can only run: `stoked licenses products`, `stoked invoices list/get/has`, and `stoked deliverables list`."
}
