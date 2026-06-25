use crate::map_local::MapLocalManager;
use std::sync::Arc;
use std::sync::atomic::Ordering;

#[tauri::command]
pub async fn set_map_local_enabled(state: tauri::State<'_, Arc<MapLocalManager>>, enabled: bool) -> Result<(), String> {
    state.is_enabled.store(enabled, Ordering::SeqCst);
    Ok(())
}

#[tauri::command]
pub async fn get_map_local_enabled(state: tauri::State<'_, Arc<MapLocalManager>>) -> Result<bool, String> {
    Ok(state.is_enabled.load(Ordering::SeqCst))
}

#[tauri::command]
pub async fn get_map_local_rules(config: tauri::State<'_, Arc<crate::config::ConfigManager>>) -> Result<Vec<crate::traffic::db::MapLocalRule>, String> {
    Ok(config.get_map_local_rules())
}

#[tauri::command]
pub async fn save_map_local_rule(config: tauri::State<'_, Arc<crate::config::ConfigManager>>, rule: crate::traffic::db::MapLocalRule) -> Result<(), String> {
    config.save_map_local_rule(rule).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_map_local_rule(config: tauri::State<'_, Arc<crate::config::ConfigManager>>, id: String) -> Result<(), String> {
    config.delete_map_local_rule(id).map_err(|e| e.to_string())
}
