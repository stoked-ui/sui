mod auth;
mod client;
mod commands;
mod config;

use anyhow::Result;
use clap::{Parser, Subcommand};
use commands::blog::BlogCommand;
use commands::{
    run_api, run_auth_keys, run_clients, run_deliverables, run_invoices, run_licenses,
    run_products, run_users, ApiCommand, AuthCommand, ClientsCommand, DeliverablesCommand,
    InvoicesCommand, LicensesCommand, ProductsCommand, UsersCommand,
};

use crate::client::{print_value, ApiClient};
use crate::config::{list_profiles, load_config_for_profile, resolve_profile, save_config_for_profile, StoredConfig};

#[derive(Debug, Parser)]
#[command(name = "stoked")]
#[command(about = "CLI for Stoked Next.js APIs", version)]
struct Cli {
    /// Override API base URL (default: STOKED_BASE_URL env, then saved config, then http://localhost:3000)
    #[arg(long, global = true)]
    base_url: Option<String>,

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
    /// Authentication and API key management
    Auth {
        #[command(subcommand)]
        command: AuthCommand,
    },
    /// Blog APIs
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

async fn run() -> Result<()> {
    let cli = Cli::parse();
    let profile = resolve_profile(cli.profile.as_deref());

    match cli.command {
        TopCommand::Auth { command } => match command {
            AuthCommand::Login => auth::login(cli.base_url, &profile, cli.json).await,
            AuthCommand::Logout => auth::logout(&profile, cli.json),
            AuthCommand::Status => auth::status(cli.base_url, &profile, cli.json).await,
            AuthCommand::Token { raw } => auth::token(&profile, raw),
            AuthCommand::Configure { api_key, name, email, role, base_url } => {
                let mut cfg = load_config_for_profile(&profile)?;
                cfg.set_auth(
                    base_url.or(cli.base_url),
                    api_key,
                    email.clone(),
                    name.clone(),
                    role.clone(),
                    None,
                );
                save_config_for_profile(&cfg, &profile)?;
                let result = serde_json::json!({
                    "configured": true,
                    "profile": profile,
                    "email": cfg.email,
                    "name": cfg.name,
                    "role": cfg.role,
                    "message": format!("Profile '{}' configured successfully", profile)
                });
                print_value(&result, cli.json)
            }
            AuthCommand::Keys { command } => {
                let (client, _) = build_client(cli.base_url, &profile)?;
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
        TopCommand::Blog { command } => {
            let (client, cfg) = build_client(cli.base_url, &profile)?;
            ensure_admin_or_agent(&cfg, "blog commands")?;
            commands::blog::run_blog(&client, &cfg, command, cli.json).await
        }
        TopCommand::Clients { command } => {
            let (client, cfg) = build_client(cli.base_url, &profile)?;
            ensure_admin(&cfg, "client commands")?;
            run_clients(&client, command, cli.json).await
        }
        TopCommand::Users { command } => {
            let (client, cfg) = build_client(cli.base_url, &profile)?;
            ensure_admin(&cfg, "user commands")?;
            run_users(&client, command, cli.json).await
        }
        TopCommand::Products { command } => {
            let (client, cfg) = build_client(cli.base_url, &profile)?;
            ensure_admin(&cfg, "product commands")?;
            run_products(&client, command, cli.json).await
        }
        TopCommand::Licenses { command } => {
            let (client, cfg) = build_client(cli.base_url, &profile)?;
            if !cfg.is_admin() && !matches!(&command, LicensesCommand::Products) {
                anyhow::bail!("{}", non_admin_permissions_message());
            }
            run_licenses(&client, &cfg, command, cli.json).await
        }
        TopCommand::Invoices { command } => {
            let (client, cfg) = build_client(cli.base_url, &profile)?;
            run_invoices(&client, &cfg, command, cli.json).await
        }
        TopCommand::Deliverables { command } => {
            let (client, cfg) = build_client(cli.base_url, &profile)?;
            run_deliverables(&client, &cfg, command, cli.json).await
        }
        TopCommand::Api(command) => {
            let (client, cfg) = build_client(cli.base_url, &profile)?;
            ensure_admin(&cfg, "api passthrough")?;
            run_api(&client, command, cli.json).await
        }
    }
}

fn build_client(base_override: Option<String>, profile: &str) -> Result<(ApiClient, StoredConfig)> {
    let cfg = load_config_for_profile(profile)?;
    let base_url = base_override.unwrap_or_else(|| cfg.effective_base_url());
    let client = ApiClient::new(base_url, cfg.api_key.clone())?;
    Ok((client, cfg))
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
