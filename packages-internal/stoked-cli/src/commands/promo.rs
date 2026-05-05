use crate::client::{print_value, ApiClient};
use anyhow::Result;
use clap::Subcommand;
use reqwest::Method;
use serde_json::{json, Value};

#[derive(Debug, Subcommand)]
pub enum PromoCommand {
    /// Create a Stripe coupon + promotion code
    Create {
        /// Display name for the coupon
        #[arg(short, long)]
        name: String,

        /// Promo code string customers enter at checkout (uppercased automatically)
        #[arg(short, long)]
        code: String,

        /// Discount type: percent | amount | free_months
        #[arg(long)]
        r#type: String,

        /// Percentage off (1–100), required for --type percent
        #[arg(long)]
        percent_off: Option<f64>,

        /// Dollar amount off, required for --type amount
        #[arg(long)]
        amount_off: Option<f64>,

        /// Number of free months, required for --type free_months
        #[arg(long)]
        free_months: Option<u32>,

        /// Duration: once | forever | repeating
        #[arg(long, default_value = "once")]
        duration: String,

        /// Months for repeating duration (required when --duration repeating and type != free_months)
        #[arg(long)]
        duration_months: Option<u32>,

        /// Restrict to a specific product by internal ID (e.g. flux, stokd-cloud)
        #[arg(long)]
        product_id: Option<String>,

        /// Maximum total redemptions
        #[arg(long)]
        max_redemptions: Option<u32>,

        /// Expiry date (ISO 8601, e.g. 2026-12-31)
        #[arg(long)]
        expires_at: Option<String>,

        /// Only allow first-time customers
        #[arg(long)]
        first_time_only: bool,

        /// Minimum purchase amount in dollars
        #[arg(long)]
        min_amount: Option<f64>,
    },

    /// List existing Stripe promotion codes
    List {
        /// Filter by product ID
        #[arg(long)]
        product_id: Option<String>,

        /// Limit number of results
        #[arg(long, default_value = "20")]
        limit: Option<u32>,
    },

    /// Delete a Stripe promotion code by ID or code string
    Delete {
        /// Promotion code ID (e.g. promo_abc123) or the code string (e.g. WELCOME1)
        id: String,
    },
}

pub async fn run_promo(
    client: &ApiClient,
    command: PromoCommand,
    compact_json: bool,
) -> Result<()> {
    let value: Value = match command {
        PromoCommand::Create {
            name,
            code,
            r#type,
            percent_off,
            amount_off,
            free_months,
            duration,
            duration_months,
            product_id,
            max_redemptions,
            expires_at,
            first_time_only,
            min_amount,
        } => {
            let mut payload = json!({
                "name": name,
                "code": code,
                "type": r#type,
                "duration": duration,
            });

            if let Some(v) = percent_off {
                payload["percentOff"] = json!(v);
            }
            if let Some(v) = amount_off {
                payload["amountOff"] = json!(v);
            }
            if let Some(v) = free_months {
                payload["freeMonths"] = json!(v);
            }
            if let Some(v) = duration_months {
                payload["durationInMonths"] = json!(v);
            }
            if let Some(v) = product_id {
                payload["productId"] = json!(v);
            }
            if let Some(v) = max_redemptions {
                payload["maxRedemptions"] = json!(v);
            }
            if let Some(v) = expires_at {
                payload["expiresAt"] = json!(v);
            }
            if first_time_only {
                payload["firstTimeTransaction"] = json!(true);
            }
            if let Some(v) = min_amount {
                payload["minimumAmount"] = json!(v);
            }

            client
                .request_json(
                    Method::POST,
                    "/api/licenses/promo-codes",
                    &[],
                    Some(payload),
                    true,
                )
                .await?
        }

        PromoCommand::List { product_id, limit } => {
            let mut query: Vec<(String, String)> = Vec::new();
            if let Some(v) = product_id {
                query.push(("productId".to_string(), v));
            }
            if let Some(v) = limit {
                query.push(("limit".to_string(), v.to_string()));
            }
            client
                .request_json(Method::GET, "/api/licenses/promo-codes", &query, None, true)
                .await?
        }

        PromoCommand::Delete { id } => {
            let path = format!("/api/licenses/promo-codes/{}", id);
            client
                .request_json(Method::DELETE, &path, &[], None, true)
                .await?
        }
    };

    print_value(&value, compact_json)
}
