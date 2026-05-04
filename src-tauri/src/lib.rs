mod models;
mod db;
use tauri::{
  menu::{Menu, MenuItem},
  tray::TrayIconBuilder,
  Manager,
};
use db::DbState;
use models::{CatalogRecord, Patron, Circulation, CirculationStats, OverdueItem, AuditResult, FinancialSummary, PaymentRecord, AcquisitionRecord, Author, Subject};
use chrono::Utc;
use sqlx::Row;

#[tauri::command]
async fn get_catalog_records(state: tauri::State<'_, DbState>) -> Result<Vec<CatalogRecord>, String> {
  let rows = sqlx::query(
    r#"
    SELECT 
      c."controlno", 
      c."Title" as title, 
      a."Author" as author, 
      c."Callno" as callno, 
      c."Copyright" as year
    FROM "public"."tblCat" c
    LEFT JOIN "public"."tblAuthor" a ON c."AuthorCode" = a."AuthorCode"
    LIMIT 100
    "#
  )
  .fetch_all(&state.pool)
  .await
  .map_err(|e| e.to_string())?;

  let records = rows.into_iter().enumerate().map(|(i, row)| CatalogRecord {
    id: i as i32 + 1,
    controlno: row.try_get("controlno").unwrap_or_default(),
    title: row.try_get("title").unwrap_or_default(),
    author: row.try_get::<Option<String>, _>("author").unwrap_or_default().unwrap_or_else(|| "Unknown".to_string()),
    callno: row.try_get("callno").unwrap_or_default(),
    year: row.try_get("year").unwrap_or_default(),
  }).collect();

  Ok(records)
}

#[tauri::command]
async fn delete_catalog_record(controlno: String, state: tauri::State<'_, DbState>) -> Result<(), String> {
  sqlx::query(r#"DELETE FROM "public"."tblCat" WHERE "controlno" = $1"#)
    .bind(controlno)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
async fn get_patrons(state: tauri::State<'_, DbState>) -> Result<Vec<Patron>, String> {
  let rows = sqlx::query(
    r#"
    SELECT 
      "Name" as name, 
      "Idno" as idno, 
      "GroupName" as group_name, 
      "Expiry" as expiry, 
      "Dept" as dept, 
      "Phone" as phone, 
      "Email" as email, 
      COALESCE("UnpaidFine", 0) as unpaid_fine
    FROM "public"."tblUser"
    "#
  )
  .fetch_all(&state.pool)
  .await
  .map_err(|e| e.to_string())?;

  let patrons = rows.into_iter().map(|row| Patron {
    name: row.try_get::<Option<String>, _>("name").unwrap_or_default().unwrap_or_default(),
    idno: row.try_get::<Option<String>, _>("idno").unwrap_or_default().unwrap_or_default(),
    group_name: row.try_get::<Option<String>, _>("group_name").unwrap_or_default().unwrap_or_default(),
    expiry: None, // Simplified, date parsing can be tricky
    dept: row.try_get("dept").unwrap_or_default(),
    phone: row.try_get("phone").unwrap_or_default(),
    email: row.try_get("email").unwrap_or_default(),
    unpaid_fine: row.try_get("unpaid_fine").unwrap_or(0),
  }).collect();

  Ok(patrons)
}

#[tauri::command]
async fn add_patron(patron: Patron, state: tauri::State<'_, DbState>) -> Result<(), String> {
  sqlx::query(
    r#"
    INSERT INTO "public"."tblUser" ("Name", "Idno", "GroupName", "Dept", "Phone", "Email", "UnpaidFine")
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    "#
  )
  .bind(patron.name)
  .bind(patron.idno)
  .bind(patron.group_name)
  .bind(patron.dept)
  .bind(patron.phone)
  .bind(patron.email)
  .bind(patron.unpaid_fine)
  .execute(&state.pool)
  .await
  .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
async fn update_patron(patron: Patron, state: tauri::State<'_, DbState>) -> Result<(), String> {
  sqlx::query(
    r#"
    UPDATE "public"."tblUser" 
    SET "Name" = $1, "GroupName" = $2, "Dept" = $3, "Phone" = $4, "Email" = $5, "UnpaidFine" = $6
    WHERE "Idno" = $7
    "#
  )
  .bind(patron.name)
  .bind(patron.group_name)
  .bind(patron.dept)
  .bind(patron.phone)
  .bind(patron.email)
  .bind(patron.unpaid_fine)
  .bind(patron.idno)
  .execute(&state.pool)
  .await
  .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
async fn delete_patron(idno: String, state: tauri::State<'_, DbState>) -> Result<(), String> {
  sqlx::query(r#"DELETE FROM "public"."tblUser" WHERE "Idno" = $1"#)
    .bind(idno)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
async fn check_out_item(accession: String, idno: String, state: tauri::State<'_, DbState>) -> Result<(), String> {
  let now = Utc::now();
  let due = now + chrono::Duration::days(7); // default 7 days
  sqlx::query(
    r#"INSERT INTO "public"."tblRent" ("Accession", "dteBorrow", "dteDue", "Idno") VALUES ($1, $2, $3, $4)"#
  )
  .bind(&accession)
  .bind(now)
  .bind(due)
  .bind(idno)
  .execute(&state.pool)
  .await
  .map_err(|e| e.to_string())?;

  sqlx::query(r#"UPDATE "public"."tblHoldings" SET "Status" = 'Checked Out' WHERE "Accession" = $1"#)
  .bind(&accession)
  .execute(&state.pool)
  .await
  .map_err(|e| e.to_string())?;
  
  Ok(())
}

#[tauri::command]
async fn return_item(accession: String, state: tauri::State<'_, DbState>) -> Result<(), String> {
  let now = Utc::now();
  sqlx::query(r#"UPDATE "public"."tblRent" SET "dteReturn" = $1 WHERE "Accession" = $2 AND "dteReturn" IS NULL"#)
  .bind(now)
  .bind(&accession)
  .execute(&state.pool)
  .await
  .map_err(|e| e.to_string())?;

  sqlx::query(r#"UPDATE "public"."tblHoldings" SET "Status" = 'Available' WHERE "Accession" = $1"#)
  .bind(&accession)
  .execute(&state.pool)
  .await
  .map_err(|e| e.to_string())?;

  Ok(())
}

#[tauri::command]
async fn get_active_loans(state: tauri::State<'_, DbState>) -> Result<Vec<Circulation>, String> {
  Ok(vec![]) // simplified for now
}

#[tauri::command]
async fn get_circulation_stats(state: tauri::State<'_, DbState>) -> Result<CirculationStats, String> {
  Ok(CirculationStats {
    total_active: 0,
    total_overdue: 0,
    total_fines: 0,
  })
}

#[tauri::command]
async fn get_overdue_items(state: tauri::State<'_, DbState>) -> Result<Vec<OverdueItem>, String> {
  Ok(vec![])
}

#[tauri::command]
async fn audit_item(accession: String, state: tauri::State<'_, DbState>) -> Result<AuditResult, String> {
  let now = Utc::now();
  sqlx::query(r#"UPDATE "public"."tblHoldings" SET last_audit = $1, "Status" = CASE WHEN "Status" = 'Missing' THEN 'Available' ELSE "Status" END WHERE "Accession" = $2"#)
  .bind(now)
  .bind(&accession)
  .execute(&state.pool)
  .await
  .map_err(|e| e.to_string())?;

  Ok(AuditResult {
      accession: accession.clone(),
      title: "Scanned Item".to_string(),
      location: "Library".to_string(),
      status: "Available".to_string(),
      last_audit: Some(now),
  })
}

#[tauri::command]
async fn pay_fine(idno: String, amount: i32, state: tauri::State<'_, DbState>) -> Result<(), String> {
  let now = Utc::now();
  sqlx::query(r#"UPDATE "public"."tblUser" SET "UnpaidFine" = GREATEST(0, COALESCE("UnpaidFine", 0) - $1) WHERE "Idno" = $2"#)
  .bind(amount)
  .bind(&idno)
  .execute(&state.pool)
  .await
  .map_err(|e| e.to_string())?;

  sqlx::query(r#"INSERT INTO "public"."tblFineCode" ("AmountPay", "Idno", "dtePay", "Cashier") VALUES ($1, $2, $3, 'System')"#)
  .bind(amount)
  .bind(&idno)
  .bind(now)
  .execute(&state.pool)
  .await
  .map_err(|e| e.to_string())?;
  
  Ok(())
}

#[tauri::command]
async fn get_financial_reports(state: tauri::State<'_, DbState>) -> Result<FinancialSummary, String> {
  Ok(FinancialSummary {
      total_collected: 0,
      total_outstanding: 0,
      recent_payments: vec![],
  })
}

#[tauri::command]
async fn get_acquisitions_report(start_date: Option<String>, end_date: Option<String>, state: tauri::State<'_, DbState>) -> Result<Vec<AcquisitionRecord>, String> {
  Ok(vec![])
}

#[tauri::command]
async fn get_authors(state: tauri::State<'_, DbState>) -> Result<Vec<Author>, String> {
  Ok(vec![])
}

#[tauri::command]
async fn update_author(code: i32, name: String, state: tauri::State<'_, DbState>) -> Result<(), String> {
  Ok(())
}

#[tauri::command]
async fn delete_author(code: i32, state: tauri::State<'_, DbState>) -> Result<(), String> {
  Ok(())
}

#[tauri::command]
async fn get_subjects(state: tauri::State<'_, DbState>) -> Result<Vec<Subject>, String> {
  Ok(vec![])
}

#[tauri::command]
async fn update_subject(code: i32, name: String, state: tauri::State<'_, DbState>) -> Result<(), String> {
  Ok(())
}

#[tauri::command]
async fn delete_subject(code: i32, state: tauri::State<'_, DbState>) -> Result<(), String> {
  Ok(())
}

#[tauri::command]
async fn check_db_connection(state: tauri::State<'_, DbState>) -> Result<String, String> {
  match sqlx::query("SELECT 1").fetch_one(&state.pool).await {
    Ok(_) => Ok("Connected to PostgreSQL".to_string()),
    Err(e) => Err(format!("Database connection failed: {}", e)),
  }
}

#[tauri::command]
async fn maximize_window(window: tauri::Window) {
  window.set_resizable(true).unwrap();
  window.maximize().unwrap();
}

#[tauri::command]
async fn reset_window_size(window: tauri::Window) {
  window.unmaximize().unwrap();
  window.set_resizable(false).unwrap();
  window.set_size(tauri::LogicalSize::new(400.0, 500.0)).unwrap();
  window.center().unwrap();
}

#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
  app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_log::Builder::default().build())
    .invoke_handler(tauri::generate_handler![
      get_catalog_records,
      delete_catalog_record,
      get_patrons,
      add_patron,
      update_patron,
      delete_patron,
      check_out_item,
      get_active_loans,
      return_item,
      get_circulation_stats,
      get_overdue_items,
      audit_item,
      pay_fine,
      get_financial_reports,
      get_acquisitions_report,
      get_authors,
      update_author,
      delete_author,
      get_subjects,
      update_subject,
      delete_subject,
      check_db_connection,
      maximize_window,
      reset_window_size,
      quit_app
    ])
    .setup(|app| {
      let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
      let show_i = MenuItem::with_id(app, "show", "Show infoLib", true, None::<&str>)?;
      let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

      let _tray = TrayIconBuilder::new()
        .menu(&menu)
        .on_menu_event(|app, event| match event.id.as_ref() {
          "quit" => {
            app.exit(0);
          }
          "show" => {
            if let Some(window) = app.get_webview_window("main") {
              let _ = window.show();
              let _ = window.set_focus();
            }
          }
          _ => {}
        })
        .build(app)?;

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
