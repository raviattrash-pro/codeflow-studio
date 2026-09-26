use tauri::Manager;

/// Greet command for IPC demo — verifies Tauri ↔ React bridge works.
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello {} from CodeFlow Studio Desktop!", name)
}

/// Get the app version from Cargo.toml.
#[tauri::command]
fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![greet, get_version])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            // Log startup
            println!("[CodeFlow Studio] Desktop app started — v{}", env!("CARGO_PKG_VERSION"));
            println!("[CodeFlow Studio] Window created: {:?}", window.title());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running CodeFlow Studio Desktop");
}
