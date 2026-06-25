use crate::map_remote::MapRemoteManager;
use crate::traffic::schema::map_remote::MapRemoteRule;
use std::sync::Arc;
use std::sync::atomic::Ordering;

#[tauri::command]
pub async fn set_map_remote_enabled(state: tauri::State<'_, Arc<MapRemoteManager>>, enabled: bool) -> Result<(), String> {
    state.is_enabled.store(enabled, Ordering::SeqCst);
    Ok(())
}

#[tauri::command]
pub async fn get_map_remote_enabled(state: tauri::State<'_, Arc<MapRemoteManager>>) -> Result<bool, String> {
    Ok(state.is_enabled.load(Ordering::SeqCst))
}

#[tauri::command]
pub async fn get_map_remote_rules(config: tauri::State<'_, Arc<crate::config::ConfigManager>>) -> Result<Vec<MapRemoteRule>, String> {
    Ok(config.get_map_remote_rules())
}

#[tauri::command]
pub async fn save_map_remote_rule(config: tauri::State<'_, Arc<crate::config::ConfigManager>>, rule: MapRemoteRule) -> Result<(), String> {
    config.save_map_remote_rule(rule).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_map_remote_rule(config: tauri::State<'_, Arc<crate::config::ConfigManager>>, id: i64) -> Result<(), String> {
    config.delete_map_remote_rule(id).map_err(|e| e.to_string())
}
