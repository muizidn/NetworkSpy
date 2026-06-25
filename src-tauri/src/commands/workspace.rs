use crate::settings::{ManagedProxySettings, InterceptAllowList};
use super::proxy_rules::refresh_active_proxy_intercept_list;
use std::sync::Arc;

#[tauri::command]
pub async fn select_workspace_dir(
    app_handle: tauri::AppHandle,
    config_manager: tauri::State<'_, Arc<crate::config::ConfigManager>>,
    session_manager: tauri::State<'_, Arc<crate::traffic::sessions::SessionManager>>,
    proxy_settings_state: tauri::State<'_, ManagedProxySettings>,
    intercept_list_state: tauri::State<'_, InterceptAllowList>,
) -> Result<String, String> {
    use tauri_plugin_dialog::DialogExt;

    let (tx, rx) = std::sync::mpsc::channel();

    app_handle.dialog().file().pick_folder(move |folder| {
        let _ = tx.send(folder);
    });

    let folder = rx.recv().map_err(|e| e.to_string())?;

    if let Some(path) = folder {
        let path_buf = match path {
            tauri_plugin_dialog::FilePath::Path(p) => p,
            tauri_plugin_dialog::FilePath::Url(u) => u.to_file_path().map_err(|_| "Invalid file URL".to_string())?,
        };

        config_manager.set_base_dir(path_buf.clone()).map_err(|e| e.to_string())?;

        let new_settings = config_manager.get_proxy_settings();
        if let Ok(mut settings) = proxy_settings_state.0.write() {
            *settings = new_settings;
        }

        refresh_active_proxy_intercept_list(&intercept_list_state, &config_manager).await?;

        session_manager.set_sessions_dir(path_buf.join("sessions"));

        let mut state = crate::workspace::load_workspace_state();
        state.current_workspace_path = Some(path_buf.clone());
        crate::workspace::save_workspace_state(&state).map_err(|e| e.to_string())?;

        Ok(path_buf.to_string_lossy().to_string())
    } else {
        Err("No folder selected".to_string())
    }
}

#[tauri::command]
pub fn get_current_workspace() -> Option<String> {
    let state = crate::workspace::load_workspace_state();
    state.current_workspace_path.map(|p| p.to_string_lossy().to_string())
}
