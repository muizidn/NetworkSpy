use crate::breakpoints::*;
use tauri::Emitter;
use std::sync::Arc;
use std::sync::atomic::Ordering;

#[tauri::command]
pub async fn set_breakpoint_enabled(state: tauri::State<'_, Arc<BreakpointManager>>, enabled: bool) -> Result<(), String> {
    state.is_enabled.store(enabled, Ordering::SeqCst);
    Ok(())
}

#[tauri::command]
pub async fn get_breakpoint_enabled(state: tauri::State<'_, Arc<BreakpointManager>>) -> Result<bool, String> {
    Ok(state.is_enabled.load(Ordering::SeqCst))
}

#[tauri::command]
pub async fn resume_breakpoint(
    app: tauri::AppHandle,
    state: tauri::State<'_, Arc<BreakpointManager>>,
    traffic_id: String,
    modified_data: Option<BreakpointData>
) -> Result<(), String> {
    let mut tasks = state.paused_tasks.write().await;
    if let Some(task) = tasks.remove(&traffic_id) {
        let _ = task.sender.send(modified_data);
        let _ = app.emit("breakpoint_resumed", traffic_id);
    }
    Ok(())
}

#[tauri::command]
pub async fn get_paused_data(
    state: tauri::State<'_, Arc<BreakpointManager>>,
    id: String
) -> Result<BreakpointData, String> {
    let tasks = state.paused_tasks.read().await;
    if let Some(task) = tasks.get(&id) {
        Ok(task.data.clone())
    } else {
        Err("Breakpoint data not found or already resumed".to_string())
    }
}

#[tauri::command]
pub async fn get_paused_breakpoints(state: tauri::State<'_, Arc<BreakpointManager>>) -> Result<Vec<BreakpointHit>, String> {
    let tasks = state.paused_tasks.read().await;
    Ok(tasks.iter().map(|(id, task)| BreakpointHit {
        id: id.clone(),
        name: task.name.clone()
    }).collect())
}

#[tauri::command]
pub fn get_breakpoints(config: tauri::State<'_, Arc<crate::config::ConfigManager>>) -> Result<Vec<crate::traffic::db::BreakpointRule>, String> {
    Ok(config.get_breakpoints())
}

#[tauri::command]
pub fn save_breakpoint(rule: crate::traffic::db::BreakpointRule, config: tauri::State<'_, Arc<crate::config::ConfigManager>>) -> Result<(), String> {
    config.save_breakpoint(rule).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_breakpoint(id: String, config: tauri::State<'_, Arc<crate::config::ConfigManager>>) -> Result<(), String> {
    config.delete_breakpoint(id).map_err(|e| e.to_string())
}
