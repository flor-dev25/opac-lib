use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DbConfig {
    pub database_url: String,
}

impl Default for DbConfig {
    fn default() -> Self {
        Self {
            database_url: "postgres://postgres:password@localhost:5432/infolib".to_string(),
        }
    }
}

pub fn get_settings_path(app: &AppHandle) -> PathBuf {
    let config_dir = app.path().app_config_dir().expect("failed to get config dir");
    if !config_dir.exists() {
        fs::create_dir_all(&config_dir).expect("failed to create config dir");
    }
    config_dir.join("db_config.json")
}

pub fn load_config(app: &AppHandle) -> DbConfig {
    let path = get_settings_path(app);
    if path.exists() {
        let data = fs::read_to_string(&path).unwrap_or_default();
        serde_json::from_str(&data).unwrap_or_default()
    } else {
        DbConfig::default()
    }
}

pub fn save_config(app: &AppHandle, config: &DbConfig) -> Result<(), String> {
    let path = get_settings_path(app);
    let data = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
    fs::write(path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_db_config(app: AppHandle) -> Result<DbConfig, String> {
    Ok(load_config(&app))
}

#[tauri::command]
pub fn save_db_config(app: AppHandle, config: DbConfig) -> Result<(), String> {
    save_config(&app, &config)
}

#[tauri::command]
pub fn export_settings(app: AppHandle, export_path: String) -> Result<(), String> {
    let config = load_config(&app);
    let data = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(export_path, data).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn import_settings(app: AppHandle, import_path: String) -> Result<(), String> {
    let data = fs::read_to_string(import_path).map_err(|e| e.to_string())?;
    let config: DbConfig = serde_json::from_str(&data).map_err(|e| e.to_string())?;
    save_config(&app, &config)?;
    Ok(())
}
