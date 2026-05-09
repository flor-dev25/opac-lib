// src-tauri/src/commands/license.rs
use crate::settings::{AppConfig, save_config};
use tauri::{AppHandle, Manager};
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};
use reqwest;

#[derive(Debug, Serialize, Deserialize)]
struct LicenseResponse {
    status: Option<String>,
    error: Option<String>,
}

#[tauri::command]
pub async fn validate_license(app: AppHandle) -> Result<bool, String> {
    let config_dir = app.path().app_config_dir().expect("failed to get config dir");
    let config_path = config_dir.join("app_config.json");
    
    if !config_path.exists() {
        return Err("Configuration file not found. Please re-run the installer.".to_string());
    }

    let data = std::fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let mut config: AppConfig = serde_json::from_str(&data).map_err(|e| e.to_string())?;

    let license_key = match &config.license_key {
        Some(k) if !k.is_empty() => k,
        _ => return Err("License key missing. Please activate the software.".to_string()),
    };

    let machine_id = match &config.machine_id {
        Some(id) => id,
        _ => return Err("Machine ID missing. Activation corrupted.".to_string()),
    };

    // 1. Attempt online verification (heartbeat)
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let res = client.post("https://gjtgotwduereuzpjiinw.supabase.co/functions/v1/verify-license")
        .json(&serde_json::json!({
            "license_key": license_key,
            "machine_id": machine_id
        }))
        .send()
        .await;

    match res {
        Ok(response) => {
            let status = response.status();
            let body: LicenseResponse = response.json().await.map_err(|e| e.to_string())?;

            if status.is_success() && (body.status.as_deref() == Some("activated") || body.status.as_deref() == Some("already_yours")) {
                // Update last_validated_at on successful heartbeat
                config.last_validated_at = Some(Utc::now().to_rfc3339());
                save_config(&app, &config).map_err(|e| e.to_string())?;
                return Ok(true);
            } else {
                let error_msg = body.error.unwrap_or_else(|| "Unknown activation error".to_string());
                return Err(format!("License Invalid: {}", error_msg));
            }
        },
        Err(_) => {
            // 2. Offline Fallback: Check 30-day grace period
            if let Some(last_val_str) = &config.last_validated_at {
                if let Ok(last_val) = DateTime::parse_from_rfc3339(last_val_str) {
                    let now = Utc::now();
                    let duration = now.signed_duration_since(last_val.with_timezone(&Utc));
                    
                    if duration.num_days() < 30 {
                        println!("[License] Offline mode: Grace period active ({} days since last check)", duration.num_days());
                        return Ok(true);
                    } else {
                        return Err("Offline for more than 30 days. Please connect to the internet to verify your license.".to_string());
                    }
                }
            }
            Err("Offline and no previous activation record found. Internet connection required for first-boot validation.".to_string())
        }
    }
}
