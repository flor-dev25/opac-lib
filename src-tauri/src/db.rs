use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use tauri::AppHandle;
use crate::settings;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct DbState {
    pub pool: Arc<Mutex<Option<PgPool>>>,
    pub remote_pool: Arc<Mutex<Option<PgPool>>>,
}

impl DbState {
    pub async fn get_pool(&self) -> Result<PgPool, String> {
        let lock = self.pool.lock().await;
        lock.clone().ok_or_else(|| "Database not connected. Please complete setup.".to_string())
    }

    pub async fn get_remote_pool(&self) -> Result<PgPool, String> {
        let lock = self.remote_pool.lock().await;
        lock.clone().ok_or_else(|| "Supabase Cloud not connected.".to_string())
    }
}

pub async fn init_db(app: &AppHandle) -> Result<PgPool, sqlx::Error> {
    let config = settings::load_config(app);
    let database_url = config.database_url;

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;

    // Migration: Add last_audit column if it doesn't exist
    sqlx::query(r#"ALTER TABLE "public"."tblHoldings" ADD COLUMN IF NOT EXISTS last_audit TIMESTAMP"#)
        .execute(&pool)
        .await?;

    // Migration: Add date_acquired column if it doesn't exist
    sqlx::query(r#"ALTER TABLE "public"."tblHoldings" ADD COLUMN IF NOT EXISTS date_acquired TIMESTAMP DEFAULT NOW()"#)
        .execute(&pool)
        .await?;

    // M006-S01-T01: Enable pgvector extension
    sqlx::query("CREATE EXTENSION IF NOT EXISTS vector")
        .execute(&pool)
        .await?;

    // M006-S01-T02: Add embedding column to tblCat
    sqlx::query(r#"ALTER TABLE "public"."tblCat" ADD COLUMN IF NOT EXISTS embedding vector(768)"#)
        .execute(&pool)
        .await?;

    Ok(pool)
}

pub async fn init_remote_db() -> Result<PgPool, sqlx::Error> {
    let remote_url = std::env::var("SUPABASE_DB_POOLER_URL")
        .map_err(|_| sqlx::Error::Configuration("SUPABASE_DB_POOLER_URL not set".into()))?;

    if remote_url.is_empty() || remote_url.contains("your-database-password") {
        return Err(sqlx::Error::Configuration("Supabase password not configured".into()));
    }

    let pool = PgPoolOptions::new()
        .max_connections(3)
        .acquire_timeout(std::time::Duration::from_secs(5))
        .connect(&remote_url)
        .await?;

    Ok(pool)
}
