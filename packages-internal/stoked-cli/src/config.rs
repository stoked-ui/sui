use anyhow::{Context, Result};
use dirs::home_dir;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

pub const DEFAULT_BASE_URL: &str = "https://stoked-ui.com";
pub const DEFAULT_PROFILE: &str = "default";

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct StoredConfig {
    pub base_url: Option<String>,
    pub api_key: Option<String>,
    pub email: Option<String>,
    pub name: Option<String>,
    pub role: Option<String>,
    pub client_id: Option<String>,
    pub updated_at_epoch_secs: Option<u64>,
}

impl StoredConfig {
    pub fn effective_base_url(&self) -> String {
        std::env::var("STOKED_BASE_URL")
            .ok()
            .filter(|v| !v.trim().is_empty())
            .or_else(|| self.base_url.clone())
            .unwrap_or_else(|| DEFAULT_BASE_URL.to_string())
    }

    pub fn has_auth(&self) -> bool {
        self.api_key
            .as_ref()
            .map(|k| k.starts_with("sk_") && !k.trim().is_empty())
            .unwrap_or(false)
    }

    pub fn set_auth(
        &mut self,
        base_url: Option<String>,
        api_key: String,
        email: Option<String>,
        name: Option<String>,
        role: Option<String>,
        client_id: Option<String>,
    ) {
        if let Some(base) = base_url {
            self.base_url = Some(base);
        }
        self.api_key = Some(api_key);
        self.email = email;
        self.name = name;
        self.role = role;
        self.client_id = client_id;
        self.updated_at_epoch_secs = Some(now_epoch_secs());
    }

    pub fn clear_auth(&mut self) {
        self.api_key = None;
        self.email = None;
        self.name = None;
        self.role = None;
        self.client_id = None;
        self.updated_at_epoch_secs = Some(now_epoch_secs());
    }

    pub fn role_str(&self) -> Option<&str> {
        self.role.as_deref()
    }

    pub fn is_admin(&self) -> bool {
        matches!(self.role_str(), Some("admin"))
    }
}

pub fn now_epoch_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0)
}

/// Resolve the active profile name from: explicit arg > STOKED_PROFILE env > "default"
pub fn resolve_profile(explicit: Option<&str>) -> String {
    if let Some(p) = explicit {
        let trimmed = p.trim();
        if !trimmed.is_empty() {
            return trimmed.to_string();
        }
    }
    if let Ok(env_val) = std::env::var("STOKED_PROFILE") {
        let trimmed = env_val.trim();
        if !trimmed.is_empty() {
            return trimmed.to_string();
        }
    }
    DEFAULT_PROFILE.to_string()
}

pub fn config_dir() -> Result<PathBuf> {
    if let Ok(path) = std::env::var("STOKED_CONFIG_DIR") {
        let trimmed = path.trim();
        if !trimmed.is_empty() {
            return Ok(PathBuf::from(trimmed));
        }
    }

    let home = home_dir().context("Could not determine home directory")?;
    Ok(home.join(".stoked"))
}

/// Config path for a given profile.
/// "default" uses `~/.stoked/config.json` (backwards-compatible).
/// Other profiles use `~/.stoked/profiles/<name>/config.json`.
pub fn config_path_for_profile(profile: &str) -> Result<PathBuf> {
    let base = config_dir()?;
    if profile == DEFAULT_PROFILE {
        Ok(base.join("config.json"))
    } else {
        Ok(base.join("profiles").join(profile).join("config.json"))
    }
}

pub fn load_config_for_profile(profile: &str) -> Result<StoredConfig> {
    let path = config_path_for_profile(profile)?;
    if !path.exists() {
        return Ok(StoredConfig::default());
    }

    let raw = fs::read_to_string(&path)
        .with_context(|| format!("Failed reading config file at {}", path.display()))?;

    let cfg: StoredConfig = serde_json::from_str(&raw)
        .with_context(|| format!("Failed parsing JSON in {}", path.display()))?;

    Ok(cfg)
}

pub fn save_config_for_profile(cfg: &StoredConfig, profile: &str) -> Result<()> {
    let path = config_path_for_profile(profile)?;
    let dir = path
        .parent()
        .context("Could not determine config directory")?;
    fs::create_dir_all(dir)
        .with_context(|| format!("Failed creating config directory {}", dir.display()))?;

    let serialized = serde_json::to_string_pretty(cfg).context("Failed serializing config JSON")?;
    fs::write(&path, serialized)
        .with_context(|| format!("Failed writing config file {}", path.display()))?;

    Ok(())
}

/// List all available profile names.
pub fn list_profiles() -> Result<Vec<String>> {
    let base = config_dir()?;
    let mut profiles = Vec::new();

    // Check for default profile
    if base.join("config.json").exists() {
        profiles.push(DEFAULT_PROFILE.to_string());
    }

    // Check profiles directory
    let profiles_dir = base.join("profiles");
    if profiles_dir.is_dir() {
        if let Ok(entries) = fs::read_dir(&profiles_dir) {
            for entry in entries.flatten() {
                if entry.path().is_dir() {
                    if entry.path().join("config.json").exists() {
                        if let Some(name) = entry.file_name().to_str() {
                            profiles.push(name.to_string());
                        }
                    }
                }
            }
        }
    }

    profiles.sort();
    Ok(profiles)
}
