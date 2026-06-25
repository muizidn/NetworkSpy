use std::sync::Arc;

#[tauri::command]
pub fn get_recent_traffic(
    db: tauri::State<'_, Arc<crate::traffic::db::TrafficDb>>,
    limit: usize,
) -> Vec<crate::traffic::db::TrafficMetadata> {
    db.get_recent_traffic(limit)
}

#[tauri::command]
pub fn get_all_metadata(
    db: tauri::State<'_, Arc<crate::traffic::db::TrafficDb>>,
    limit: Option<usize>,
) -> Vec<crate::traffic::db::TrafficMetadata> {
    db.get_all_metadata(limit.unwrap_or(10)).unwrap_or_default()
}

#[tauri::command]
pub fn get_filter_presets(config: tauri::State<'_, Arc<crate::config::ConfigManager>>) -> Result<Vec<crate::traffic::db::FilterPreset>, String> {
    Ok(config.get_filter_presets())
}

#[tauri::command]
pub fn add_filter_preset(preset: crate::traffic::db::FilterPreset, config: tauri::State<'_, Arc<crate::config::ConfigManager>>) -> Result<(), String> {
    config.add_filter_preset(preset).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_filter_preset(
    id: String,
    name: Option<String>,
    description: Option<String>,
    filters: Option<String>,
    config: tauri::State<'_, Arc<crate::config::ConfigManager>>
) -> Result<(), String> {
    config.update_filter_preset(id, name, description, filters).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_filter_preset(id: String, config: tauri::State<'_, Arc<crate::config::ConfigManager>>) -> Result<(), String> {
    config.delete_filter_preset(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn validate_filter_preset_command(preset: serde_json::Value) -> Result<(), String> {
    crate::mcp::validator::validate_filter_preset(&preset)
}
