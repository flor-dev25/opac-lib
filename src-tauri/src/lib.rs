mod models;
mod db;
use tauri::{
  menu::{Menu, MenuItem},
  tray::TrayIconBuilder,
  Manager,
};
use db::DbState;
use models::CatalogRecord;

#[tauri::command]
async fn get_catalog_records(state: tauri::State<'_, DbState>) -> Result<Vec<CatalogRecord>, String> {
  let rows = sqlx::query!(
    r#"
    SELECT 
      c.controlno, 
      c.title, 
      a.author, 
      c.callno, 
      c.copyright as year
    FROM tblCat c
    LEFT JOIN tblAuthor a ON c."AuthorCode" = a."AuthorCode"
    LIMIT 100
    "#
  )
  .fetch_all(&state.pool)
  .await
  .map_err(|e| e.to_string())?;

  let records = rows.into_iter().enumerate().map(|(i, row)| CatalogRecord {
    id: i as i32 + 1,
    controlno: row.controlno,
    title: row.title,
    author: row.author.unwrap_or_else(|| "Unknown".to_string()),
    callno: row.callno,
    year: row.year,
  }).collect();

  Ok(records)
}

#[tauri::command]
async fn delete_catalog_record(controlno: String, state: tauri::State<'_, DbState>) -> Result<(), String> {
  sqlx::query!("DELETE FROM tblCat WHERE controlno = $1", controlno)
    .execute(&state.pool)
    .await
    .map_err(|e| e.to_string())?;
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
        .icon(app.default_window_icon().unwrap().clone())
        .build(app)?;

      let pool = tauri::async_runtime::block_on(async {
        db::init_db().await.expect("Failed to initialize database")
      });
      app.manage(DbState { pool });
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      maximize_window, 
      reset_window_size,
      check_db_connection,
      quit_app,
      get_catalog_records,
      delete_catalog_record
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
