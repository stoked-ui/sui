use anyhow::{anyhow, bail, Context, Result};
use reqwest::{Method, StatusCode};
use serde_json::{json, Value};
use std::fs;
use std::path::PathBuf;

#[derive(Clone, Debug)]
pub struct ApiClient {
    http: reqwest::Client,
    pub base_url: String,
    pub api_key: Option<String>,
}

impl ApiClient {
    pub fn new(base_url: String, api_key: Option<String>) -> Result<Self> {
        let normalized = normalize_base_url(&base_url);
        let http = reqwest::Client::builder()
            .user_agent("stoked-cli/0.1.0")
            .build()
            .context("Failed to initialize HTTP client")?;

        Ok(Self {
            http,
            base_url: normalized,
            api_key,
        })
    }

    pub async fn request_json(
        &self,
        method: Method,
        path: &str,
        query: &[(String, String)],
        body: Option<Value>,
        require_auth: bool,
    ) -> Result<Value> {
        if require_auth && self.api_key.is_none() {
            bail!("Not authenticated. Run `stoked auth login` first.");
        }

        let url = self.build_url(path);
        let mut req = self.http.request(method, &url);

        if !query.is_empty() {
            req = req.query(query);
        }

        if let Some(key) = &self.api_key {
            req = req.bearer_auth(key);
        }

        if let Some(payload) = body {
            req = req.json(&payload);
        }

        let response = req
            .send()
            .await
            .with_context(|| format!("Request failed: {}", url))?;

        let status = response.status();
        let text = response
            .text()
            .await
            .context("Failed reading response body")?;

        if status.is_success() {
            return parse_json_or_text(status, text);
        }

        let parsed = parse_json_or_text(status, text.clone())?;
        let message = parsed
            .get("message")
            .and_then(|v| v.as_str())
            .unwrap_or_else(|| status.canonical_reason().unwrap_or("Request failed"));

        Err(anyhow!("{} (HTTP {})", message, status.as_u16()))
    }

    pub fn build_url(&self, path: &str) -> String {
        if path.starts_with("http://") || path.starts_with("https://") {
            return path.to_string();
        }

        let mut normalized = path.trim().to_string();
        if !normalized.starts_with('/') {
            normalized.insert(0, '/');
        }
        if !normalized.starts_with("/api/") {
            normalized = format!("/api{}", normalized);
        }

        format!("{}{}", self.base_url, normalized)
    }
}

fn normalize_base_url(raw: &str) -> String {
    let trimmed = raw.trim();
    if trimmed.ends_with('/') {
        trimmed.trim_end_matches('/').to_string()
    } else {
        trimmed.to_string()
    }
}

fn parse_json_or_text(status: StatusCode, text: String) -> Result<Value> {
    if text.trim().is_empty() {
        return Ok(json!({ "status": status.as_u16() }));
    }

    match serde_json::from_str::<Value>(&text) {
        Ok(v) => Ok(v),
        Err(_) => Ok(json!({ "status": status.as_u16(), "text": text })),
    }
}

pub fn parse_kv_pairs(pairs: &[String]) -> Result<Vec<(String, String)>> {
    let mut out = Vec::new();

    for pair in pairs {
        let (k, v) = pair
            .split_once('=')
            .ok_or_else(|| anyhow!("Invalid query pair '{}'. Expected key=value", pair))?;

        let key = k.trim();
        let value = v.trim();

        if key.is_empty() {
            bail!("Invalid query pair '{}': key cannot be empty", pair);
        }

        out.push((key.to_string(), value.to_string()));
    }

    Ok(out)
}

pub fn parse_optional_json_body(
    data_json: Option<&String>,
    data_file: Option<&PathBuf>,
) -> Result<Option<Value>> {
    if data_json.is_some() && data_file.is_some() {
        bail!("Use either --data-json or --data-file, not both.");
    }

    if let Some(raw) = data_json {
        let value: Value = serde_json::from_str(raw)
            .with_context(|| "--data-json must be valid JSON".to_string())?;
        return Ok(Some(value));
    }

    if let Some(path) = data_file {
        let raw = fs::read_to_string(path)
            .with_context(|| format!("Failed reading JSON file {}", path.display()))?;
        let value: Value = serde_json::from_str(&raw)
            .with_context(|| format!("Invalid JSON in {}", path.display()))?;
        return Ok(Some(value));
    }

    Ok(None)
}

pub fn print_value(value: &Value, compact: bool) -> Result<()> {
    if compact {
        println!("{}", serde_json::to_string(value)?);
    } else {
        println!("{}", serde_json::to_string_pretty(value)?);
    }
    Ok(())
}
