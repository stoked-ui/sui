use anyhow::{anyhow, bail, Context, Result};
use reqwest::header::CONTENT_TYPE;
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
        let method_name = method.as_str().to_string();
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
        let message = extract_error_message(status, &parsed).unwrap_or_else(|| {
            status
                .canonical_reason()
                .unwrap_or("Request failed")
                .to_string()
        });

        Err(anyhow!(
            "{} {} failed: {} (HTTP {})",
            method_name,
            url,
            message,
            status.as_u16()
        ))
    }

    pub async fn request_bytes(
        &self,
        method: Method,
        path: &str,
        query: &[(String, String)],
        body: Vec<u8>,
        content_type: &str,
        require_auth: bool,
    ) -> Result<Value> {
        if require_auth && self.api_key.is_none() {
            bail!("Not authenticated. Run `stoked auth login` first.");
        }

        let url = self.build_url(path);
        let method_name = method.as_str().to_string();
        let mut req = self.http.request(method, &url);

        if !query.is_empty() {
            req = req.query(query);
        }

        if let Some(key) = &self.api_key {
            req = req.bearer_auth(key);
        }

        let response = req
            .header(CONTENT_TYPE, content_type)
            .body(body)
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
        let message = extract_error_message(status, &parsed).unwrap_or_else(|| {
            status
                .canonical_reason()
                .unwrap_or("Request failed")
                .to_string()
        });

        Err(anyhow!(
            "{} {} failed: {} (HTTP {})",
            method_name,
            url,
            message,
            status.as_u16()
        ))
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
        // Ensure trailing slash to avoid 308 redirects that strip auth headers
        if !normalized.ends_with('/') && !normalized.contains('?') {
            normalized.push('/');
        }

        format!("{}{}", self.base_url, normalized)
    }

    pub fn is_localhost(&self) -> bool {
        self.base_url.contains("localhost") || self.base_url.contains("127.0.0.1")
    }

    pub async fn put_bytes_to_url(
        &self,
        url: &str,
        body: Vec<u8>,
        content_type: &str,
    ) -> Result<String> {
        let response = self
            .http
            .put(url)
            .header(CONTENT_TYPE, content_type)
            .body(body)
            .send()
            .await
            .with_context(|| format!("PUT request failed: {}", url))?;

        let status = response.status();
        if !status.is_success() {
            let text = response
                .text()
                .await
                .unwrap_or_else(|_| "Failed reading response body".to_string());
            return Err(anyhow!(
                "PUT {} failed: {} (HTTP {})",
                url,
                summarize_response_text(&text),
                status.as_u16()
            ));
        }

        let headers = response.headers().clone();
        let etag = headers
            .get("etag")
            .and_then(|value| value.to_str().ok())
            .or_else(|| headers.get("ETag").and_then(|value| value.to_str().ok()))
            .map(|value| value.trim_matches('"').to_string());

        etag.ok_or_else(|| anyhow!("PUT {} succeeded but response did not include an ETag", url))
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

fn extract_error_message(status: StatusCode, parsed: &Value) -> Option<String> {
    let mut parts = Vec::new();

    for key in ["message", "error", "details"] {
        if let Some(text) = parsed.get(key).and_then(value_to_error_text) {
            if !parts.contains(&text) {
                parts.push(text);
            }
        }
    }

    if parts.is_empty() {
        if let Some(text) = parsed.get("text").and_then(|value| value.as_str()) {
            parts.push(summarize_response_text(text));
        }
    }

    if parts.is_empty() && parsed.get("status").is_some() {
        parts.push(
            status
                .canonical_reason()
                .unwrap_or("Request failed")
                .to_string(),
        );
    }

    if parts.is_empty() {
        None
    } else {
        Some(parts.join(": "))
    }
}

fn value_to_error_text(value: &Value) -> Option<String> {
    match value {
        Value::Null => None,
        Value::Bool(v) => Some(v.to_string()),
        Value::Number(v) => Some(v.to_string()),
        Value::String(v) => {
            let trimmed = v.trim();
            if trimmed.is_empty() {
                None
            } else {
                Some(trimmed.to_string())
            }
        }
        Value::Array(items) => {
            let values = items
                .iter()
                .filter_map(value_to_error_text)
                .collect::<Vec<_>>();
            if values.is_empty() {
                None
            } else {
                Some(values.join(", "))
            }
        }
        Value::Object(_) => {
            let serialized = serde_json::to_string(value).ok()?;
            Some(truncate_text(serialized, 240))
        }
    }
}

fn summarize_response_text(text: &str) -> String {
    let normalized = text.split_whitespace().collect::<Vec<_>>().join(" ");
    if normalized.starts_with('<') {
        "Server returned a non-JSON error response".to_string()
    } else {
        truncate_text(normalized, 240)
    }
}

fn truncate_text(text: String, max_len: usize) -> String {
    let chars = text.chars().collect::<Vec<_>>();
    if chars.len() <= max_len {
        return text;
    }

    let truncated = chars
        .into_iter()
        .take(max_len.saturating_sub(3))
        .collect::<String>();
    format!("{}...", truncated)
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn extract_error_message_prefers_structured_fields() {
        let parsed = json!({
            "message": "Create deliverable failed",
            "details": "A deliverable with the same title and version already exists"
        });

        assert_eq!(
            extract_error_message(StatusCode::CONFLICT, &parsed).as_deref(),
            Some("Create deliverable failed: A deliverable with the same title and version already exists")
        );
    }

    #[test]
    fn extract_error_message_summarizes_plain_text_bodies() {
        let parsed = json!({
            "status": 500,
            "text": "<html><body>Internal error</body></html>"
        });

        assert_eq!(
            extract_error_message(StatusCode::INTERNAL_SERVER_ERROR, &parsed).as_deref(),
            Some("Server returned a non-JSON error response")
        );
    }
}
