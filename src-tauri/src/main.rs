// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  // Load .env file for dev mode (DEV_DATABASE_URL, etc.)
  let _ = dotenvy::dotenv();
  app_lib::run();
}
