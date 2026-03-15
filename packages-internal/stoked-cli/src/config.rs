use anyhow::{Context, Result};
use dirs::home_dir;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

pub const DEFAULT_BASE_URL: &str = "https://stoked-ui.com";
pub const DEFAULT_PROFILE: &str = "default";
pub const LOCAL_DEV_BASE_URL: &str = "http://localhost:5199";

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq, Eq)]
pub struct StoredAuthSession {
    pub api_key: Option<String>,
    pub email: Option<String>,
    pub name: Option<String>,
    pub role: Option<String>,
    pub client_id: Option<String>,
    pub updated_at_epoch_secs: Option<u64>,
}

impl StoredAuthSession {
    fn has_auth(&self) -> bool {
        self.api_key
            .as_ref()
            .map(|k| k.starts_with("sk_") && !k.trim().is_empty())
            .unwrap_or(false)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct StoredConfig {
    pub base_url: Option<String>,
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    pub auth_sessions: BTreeMap<String, StoredAuthSession>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub api_key: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub email: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub role: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub client_id: Option<String>,
    pub deliverables_dir: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub updated_at_epoch_secs: Option<u64>,
}

impl StoredConfig {
    pub fn default_base_url(&self) -> String {
        if let Ok(env_value) = std::env::var("STOKED_BASE_URL") {
            let trimmed = env_value.trim();
            if !trimmed.is_empty() {
                return normalize_base_url(trimmed);
            }
        }

        match self.base_url.as_deref().map(normalize_base_url) {
            Some(value) if value == LOCAL_DEV_BASE_URL => DEFAULT_BASE_URL.to_string(),
            Some(value) => value,
            None => DEFAULT_BASE_URL.to_string(),
        }
    }

    pub fn has_auth(&self) -> bool {
        self.api_key
            .as_ref()
            .map(|k| k.starts_with("sk_") && !k.trim().is_empty())
            .unwrap_or(false)
    }

    pub fn active_view(&self, base_url: &str) -> Self {
        let mut active = self.clone();
        active.apply_auth_session(self.auth_session_for_base_url(base_url).as_ref());
        active
    }

    pub fn has_auth_for_base_url(&self, base_url: &str) -> bool {
        self.auth_session_for_base_url(base_url)
            .map(|session| session.has_auth())
            .unwrap_or(false)
    }

    pub fn set_auth_for_base_url(
        &mut self,
        base_url: &str,
        api_key: String,
        email: Option<String>,
        name: Option<String>,
        role: Option<String>,
        client_id: Option<String>,
    ) {
        self.migrate_legacy_auth();
        self.auth_sessions.insert(
            normalize_base_url(base_url),
            StoredAuthSession {
                api_key: Some(api_key),
                email,
                name,
                role,
                client_id,
                updated_at_epoch_secs: Some(now_epoch_secs()),
            },
        );
    }

    pub fn clear_auth_for_base_url(&mut self, base_url: &str) -> bool {
        self.migrate_legacy_auth();
        self.auth_sessions
            .remove(&normalize_base_url(base_url))
            .map(|session| session.has_auth())
            .unwrap_or(false)
    }

    pub fn role_str(&self) -> Option<&str> {
        self.role.as_deref()
    }

    pub fn is_admin(&self) -> bool {
        matches!(self.role_str(), Some("admin"))
    }

    fn auth_session_for_base_url(&self, base_url: &str) -> Option<StoredAuthSession> {
        let normalized = normalize_base_url(base_url);
        self.auth_sessions
            .get(&normalized)
            .cloned()
            .or_else(|| self.legacy_auth_for_base_url(&normalized))
    }

    fn legacy_auth_for_base_url(&self, normalized_base_url: &str) -> Option<StoredAuthSession> {
        if !self.has_auth() || self.legacy_auth_base_url() != normalized_base_url {
            return None;
        }

        Some(StoredAuthSession {
            api_key: self.api_key.clone(),
            email: self.email.clone(),
            name: self.name.clone(),
            role: self.role.clone(),
            client_id: self.client_id.clone(),
            updated_at_epoch_secs: self.updated_at_epoch_secs,
        })
    }

    fn legacy_auth_base_url(&self) -> String {
        self.base_url
            .as_deref()
            .map(normalize_base_url)
            .unwrap_or_else(|| DEFAULT_BASE_URL.to_string())
    }

    fn apply_auth_session(&mut self, session: Option<&StoredAuthSession>) {
        self.api_key = session.and_then(|value| value.api_key.clone());
        self.email = session.and_then(|value| value.email.clone());
        self.name = session.and_then(|value| value.name.clone());
        self.role = session.and_then(|value| value.role.clone());
        self.client_id = session.and_then(|value| value.client_id.clone());
        self.updated_at_epoch_secs = session.and_then(|value| value.updated_at_epoch_secs);
    }

    fn migrate_legacy_auth(&mut self) {
        let legacy_base_url = self.legacy_auth_base_url();
        if let Some(legacy_auth) = self.legacy_auth_for_base_url(&legacy_base_url) {
            self.auth_sessions
                .entry(legacy_base_url)
                .or_insert(legacy_auth);
        }

        self.api_key = None;
        self.email = None;
        self.name = None;
        self.role = None;
        self.client_id = None;
        self.updated_at_epoch_secs = None;
    }

    fn canonicalized_for_save(&self) -> Self {
        let mut canonical = self.clone();
        canonical.migrate_legacy_auth();
        canonical.base_url = canonical.base_url.as_deref().map(normalize_base_url);
        canonical
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

pub fn normalize_base_url(raw: &str) -> String {
    let trimmed = raw.trim();
    if trimmed.ends_with('/') {
        trimmed.trim_end_matches('/').to_string()
    } else {
        trimmed.to_string()
    }
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

    let serialized = serde_json::to_string_pretty(&cfg.canonicalized_for_save())
        .context("Failed serializing config JSON")?;
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

#[cfg(test)]
mod tests {
    use super::{normalize_base_url, StoredConfig, DEFAULT_BASE_URL, LOCAL_DEV_BASE_URL};

    #[test]
    fn active_view_uses_auth_for_selected_base_url() {
        let mut cfg = StoredConfig::default();
        cfg.set_auth_for_base_url(
            DEFAULT_BASE_URL,
            "sk_prod".to_string(),
            Some("prod@example.com".to_string()),
            Some("Prod User".to_string()),
            Some("admin".to_string()),
            None,
        );
        cfg.set_auth_for_base_url(
            "http://localhost:5199/",
            "sk_dev".to_string(),
            Some("dev@example.com".to_string()),
            Some("Dev User".to_string()),
            Some("agent".to_string()),
            Some("client-dev".to_string()),
        );

        let prod = cfg.active_view(DEFAULT_BASE_URL);
        let dev = cfg.active_view("http://localhost:5199");

        assert_eq!(prod.api_key.as_deref(), Some("sk_prod"));
        assert_eq!(prod.email.as_deref(), Some("prod@example.com"));
        assert_eq!(prod.role.as_deref(), Some("admin"));
        assert_eq!(dev.api_key.as_deref(), Some("sk_dev"));
        assert_eq!(dev.email.as_deref(), Some("dev@example.com"));
        assert_eq!(dev.client_id.as_deref(), Some("client-dev"));
        assert!(cfg.has_auth_for_base_url(DEFAULT_BASE_URL));
        assert!(cfg.has_auth_for_base_url("http://localhost:5199/"));
        assert_eq!(
            cfg.auth_sessions.keys().collect::<Vec<_>>(),
            vec![
                &normalize_base_url("http://localhost:5199/"),
                &normalize_base_url(DEFAULT_BASE_URL)
            ]
        );
    }

    #[test]
    fn legacy_auth_only_matches_its_legacy_base_url() {
        let cfg = StoredConfig {
            api_key: Some("sk_prod".to_string()),
            email: Some("prod@example.com".to_string()),
            name: Some("Prod User".to_string()),
            ..StoredConfig::default()
        };

        let prod = cfg.active_view(DEFAULT_BASE_URL);
        let dev = cfg.active_view("http://localhost:5199");

        assert_eq!(prod.api_key.as_deref(), Some("sk_prod"));
        assert_eq!(prod.email.as_deref(), Some("prod@example.com"));
        assert!(dev.api_key.is_none());
        assert!(dev.email.is_none());
    }

    #[test]
    fn clear_auth_for_one_base_url_preserves_other_sessions() {
        let mut cfg = StoredConfig::default();
        cfg.set_auth_for_base_url(
            DEFAULT_BASE_URL,
            "sk_prod".to_string(),
            None,
            None,
            Some("admin".to_string()),
            None,
        );
        cfg.set_auth_for_base_url(
            "http://localhost:5199",
            "sk_dev".to_string(),
            None,
            None,
            Some("agent".to_string()),
            None,
        );

        assert!(cfg.clear_auth_for_base_url("http://localhost:5199/"));
        assert!(cfg.active_view(DEFAULT_BASE_URL).has_auth());
        assert!(!cfg.active_view("http://localhost:5199").has_auth());
    }

    #[test]
    fn canonicalized_for_save_migrates_legacy_auth_into_auth_sessions() {
        let cfg = StoredConfig {
            base_url: Some(format!("{}/", DEFAULT_BASE_URL)),
            api_key: Some("sk_prod".to_string()),
            email: Some("prod@example.com".to_string()),
            ..StoredConfig::default()
        };

        let canonical = cfg.canonicalized_for_save();
        let migrated = canonical
            .auth_sessions
            .get(DEFAULT_BASE_URL)
            .expect("expected migrated prod auth session");

        assert_eq!(canonical.base_url.as_deref(), Some(DEFAULT_BASE_URL));
        assert!(canonical.api_key.is_none());
        assert_eq!(migrated.api_key.as_deref(), Some("sk_prod"));
        assert_eq!(migrated.email.as_deref(), Some("prod@example.com"));
    }

    #[test]
    fn default_base_url_ignores_saved_localhost_value() {
        let cfg = StoredConfig {
            base_url: Some(format!("{}/", LOCAL_DEV_BASE_URL)),
            ..StoredConfig::default()
        };

        assert_eq!(cfg.default_base_url(), DEFAULT_BASE_URL);
    }
}
