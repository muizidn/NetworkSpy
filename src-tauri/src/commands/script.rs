use crate::scripting::ScriptManager;
use std::sync::Arc;
use std::sync::atomic::Ordering;

#[tauri::command]
pub async fn set_script_enabled(state: tauri::State<'_, Arc<ScriptManager>>, enabled: bool) -> Result<(), String> {
    state.is_enabled.store(enabled, Ordering::SeqCst);
    Ok(())
}

#[tauri::command]
pub async fn get_script_enabled(state: tauri::State<'_, Arc<ScriptManager>>) -> Result<bool, String> {
    Ok(state.is_enabled.load(Ordering::SeqCst))
}

#[tauri::command]
pub fn get_scripts(config: tauri::State<'_, Arc<crate::config::ConfigManager>>) -> Result<Vec<crate::traffic::db::ScriptRule>, String> {
    Ok(config.get_scripts())
}

#[tauri::command]
pub fn save_script(rule: crate::traffic::db::ScriptRule, config: tauri::State<'_, Arc<crate::config::ConfigManager>>) -> Result<(), String> {
    config.save_script(rule).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_script(id: String, config: tauri::State<'_, Arc<crate::config::ConfigManager>>) -> Result<(), String> {
    config.delete_script(id).map_err(|e| e.to_string())
}
