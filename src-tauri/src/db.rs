use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;
use std::env;

pub struct DbState {
    pub pool: PgPool,
}

pub async fn init_db() -> Result<PgPool, sqlx::Error> {
    dotenvy::dotenv().ok();
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

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

    Ok(pool)
}
