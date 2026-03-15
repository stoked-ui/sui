use crate::client::{print_value, ApiClient};
use crate::config::{load_config_for_profile, normalize_base_url, save_config_for_profile};
use anyhow::{anyhow, bail, Context, Result};
use rand::distr::Alphanumeric;
use rand::Rng;
use reqwest::Method;
use serde_json::json;
use std::collections::HashMap;
use std::net::TcpListener;
use std::time::{Duration, Instant};
use tiny_http::{Header, Response, StatusCode};
use url::form_urlencoded::byte_serialize;
use url::Url;

const CALLBACK_TIMEOUT_SECS: u64 = 300;

#[derive(Debug)]
struct CallbackPayload {
    key: String,
    state: String,
    email: Option<String>,
    name: Option<String>,
    role: Option<String>,
    client_id: Option<String>,
}

pub async fn login(
    base_url_override: Option<String>,
    profile: &str,
    compact_json: bool,
    impersonate: Option<String>,
) -> Result<()> {
    let mut cfg = load_config_for_profile(profile)?;
    let base_url = normalize_base_url(
        &base_url_override
            .clone()
            .unwrap_or_else(|| cfg.default_base_url()),
    );

    let port = pick_open_port()?;
    let state = random_state(32);
    let name = "stoked CLI";
    let encoded_name: String = byte_serialize(name.as_bytes()).collect();
    let mut auth_url = format!(
        "{}/cli/auth?port={}&state={}&name={}",
        base_url, port, state, encoded_name
    );
    if let Some(target_email) = impersonate
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        let encoded_email: String = byte_serialize(target_email.as_bytes()).collect();
        auth_url.push_str(&format!("&impersonate={}", encoded_email));
    }

    println!("Opening browser for OAuth login...");
    if let Err(err) = open::that(&auth_url) {
        eprintln!("Could not open browser automatically: {}", err);
        eprintln!("Open this URL manually:\n{}", auth_url);
    }

    let expected_state = state.clone();
    let callback_task: tokio::task::JoinHandle<Result<CallbackPayload>> =
        tokio::task::spawn_blocking(move || {
            wait_for_callback(
                port,
                expected_state,
                Duration::from_secs(CALLBACK_TIMEOUT_SECS),
            )
        });

    let callback = tokio::select! {
        res = callback_task => {
            res.map_err(|e| anyhow!("Callback listener task failed: {}", e))??
        }
        _ = tokio::signal::ctrl_c() => {
            println!("\nLogin cancelled by user.");
            return Ok(());
        }
    };

    if callback.state != state {
        bail!("OAuth state mismatch. Please retry login.");
    }

    cfg.set_auth_for_base_url(
        &base_url,
        callback.key,
        callback.email.clone(),
        callback.name.clone(),
        callback.role.clone(),
        callback.client_id.clone(),
    );
    save_config_for_profile(&cfg, profile)?;

    let result = json!({
        "authenticated": true,
        "profile": profile,
        "base_url": base_url,
        "email": callback.email,
        "name": callback.name,
        "role": callback.role,
        "client_id": callback.client_id,
        "message": "Login successful"
    });

    print_value(&result, compact_json)
}

pub fn logout(base_url_override: Option<String>, profile: &str, compact_json: bool) -> Result<()> {
    let mut cfg = load_config_for_profile(profile)?;
    let base_url = normalize_base_url(
        &base_url_override
            .clone()
            .unwrap_or_else(|| cfg.default_base_url()),
    );
    let had_auth = cfg.clear_auth_for_base_url(&base_url);
    save_config_for_profile(&cfg, profile)?;

    let result = json!({
        "authenticated": false,
        "profile": profile,
        "base_url": base_url,
        "message": if had_auth { "Logged out" } else { "No active session" }
    });

    print_value(&result, compact_json)
}

pub async fn status(
    base_url_override: Option<String>,
    profile: &str,
    compact_json: bool,
) -> Result<()> {
    let cfg = load_config_for_profile(profile)?;
    let base_url = normalize_base_url(
        &base_url_override
            .clone()
            .unwrap_or_else(|| cfg.default_base_url()),
    );
    let active_cfg = cfg.active_view(&base_url);

    if !active_cfg.has_auth() {
        let result = json!({
            "authenticated": false,
            "base_url": base_url,
            "message": "Not logged in"
        });
        return print_value(&result, compact_json);
    }

    let client = ApiClient::new(base_url.clone(), active_cfg.api_key.clone())?;
    let verification = client
        .request_json(Method::GET, "/auth/api-keys", &[], None, true)
        .await;

    let result = match verification {
        Ok(keys) => json!({
            "authenticated": true,
            "profile": profile,
            "base_url": base_url,
            "email": active_cfg.email,
            "name": active_cfg.name,
            "role": active_cfg.role,
            "client_id": active_cfg.client_id,
            "api_keys_visible": keys.as_array().map(|a| a.len()).unwrap_or(0)
        }),
        Err(err) => json!({
            "authenticated": true,
            "profile": profile,
            "base_url": base_url,
            "email": active_cfg.email,
            "name": active_cfg.name,
            "role": active_cfg.role,
            "client_id": active_cfg.client_id,
            "warning": format!("Stored key exists but verification failed: {}", err)
        }),
    };

    print_value(&result, compact_json)
}

pub fn token(base_url_override: Option<String>, profile: &str, raw: bool) -> Result<()> {
    let cfg = load_config_for_profile(profile)?;
    let base_url = normalize_base_url(
        &base_url_override
            .clone()
            .unwrap_or_else(|| cfg.default_base_url()),
    );
    let active_cfg = cfg.active_view(&base_url);
    let key = active_cfg
        .api_key
        .as_ref()
        .filter(|k| k.starts_with("sk_"))
        .ok_or_else(|| anyhow!("Not authenticated. Run `stoked auth login` first."))?;

    if raw {
        println!("{}", key);
    } else {
        println!("{}", json!({ "api_key": key }));
    }

    Ok(())
}

fn pick_open_port() -> Result<u16> {
    let listener =
        TcpListener::bind("127.0.0.1:0").context("Failed to allocate local callback port")?;
    let port = listener
        .local_addr()
        .context("Failed to read local callback port")?
        .port();
    drop(listener);
    Ok(port)
}

fn random_state(len: usize) -> String {
    let mut rng = rand::rng();
    (0..len)
        .map(|_| rng.sample(Alphanumeric) as char)
        .collect::<String>()
        .to_lowercase()
}

fn wait_for_callback(
    port: u16,
    expected_state: String,
    timeout: Duration,
) -> Result<CallbackPayload> {
    let server = tiny_http::Server::http(("127.0.0.1", port))
        .map_err(|e| anyhow!("Failed to start callback server on port {}: {}", port, e))?;

    println!(
        "Waiting for OAuth callback on http://127.0.0.1:{}/callback ...",
        port
    );

    let start = Instant::now();
    loop {
        let elapsed = start.elapsed();
        if elapsed >= timeout {
            bail!(
                "Timed out waiting for OAuth callback after {} seconds",
                timeout.as_secs()
            );
        }

        let remaining = timeout - elapsed;
        match server.recv_timeout(remaining) {
            Ok(Some(req)) => {
                let req_url = req.url().to_string();
                let url = format!("http://localhost{}", req_url);
                let parsed = Url::parse(&url)
                    .with_context(|| format!("Failed parsing callback URL: {}", req_url))?;

                if parsed.path() != "/callback" {
                    let response =
                        Response::from_string("Not found").with_status_code(StatusCode(404));
                    let _ = req.respond(response);
                    continue;
                }

                let params: HashMap<String, String> = parsed
                    .query_pairs()
                    .map(|(k, v)| (k.to_string(), v.to_string()))
                    .collect();

                let key = params.get("key").cloned().unwrap_or_default();
                let state = params.get("state").cloned().unwrap_or_default();
                let email = params.get("email").cloned();
                let name = params.get("name").cloned();
                let role = params.get("role").cloned();
                let client_id = params.get("client_id").cloned();

                if key.is_empty() {
                    let response = Response::from_string("Missing key in callback")
                        .with_status_code(StatusCode(400));
                    let _ = req.respond(response);
                    continue;
                }

                if state != expected_state {
                    let response =
                        Response::from_string("State mismatch").with_status_code(StatusCode(400));
                    let _ = req.respond(response);
                    bail!(
                        "OAuth state mismatch. Expected {}, received {}",
                        expected_state,
                        state
                    );
                }

                let html = r#"<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Stoked CLI — Authenticated</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #0a0a0a;
      color: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1rem;
    }
    .card {
      text-align: center;
      max-width: 420px;
      width: 100%;
      padding: 2.5rem 2rem;
      background: #141414;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.4);
      animation: fadeIn 0.4s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .check {
      width: 56px;
      height: 56px;
      margin: 0 auto 1.25rem;
      border-radius: 50%;
      background: #16a34a22;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .check svg {
      width: 28px;
      height: 28px;
      stroke: #22c55e;
      stroke-width: 3;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    h1 {
      font-size: 1.35rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #f5f5f5;
    }
    p {
      font-size: 0.95rem;
      color: #888;
      line-height: 1.5;
    }
    .hint {
      margin-top: 1.5rem;
      font-size: 0.8rem;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="check">
      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
    <h1>Authenticated</h1>
    <p>You're all set. Return to your terminal to continue.</p>
    <p class="hint">You can safely close this tab.</p>
  </div>
  <script>setTimeout(function(){ window.close(); }, 4000);</script>
</body>
</html>"#;
                let response = Response::from_string(html)
                    .with_status_code(StatusCode(200))
                    .with_header(
                        "Content-Type: text/html; charset=utf-8"
                            .parse::<Header>()
                            .unwrap(),
                    );
                let _ = req.respond(response);

                return Ok(CallbackPayload {
                    key,
                    state,
                    email,
                    name,
                    role,
                    client_id,
                });
            }
            Ok(None) => continue,
            Err(err) => return Err(anyhow!("Callback listener error: {}", err)),
        }
    }
}
