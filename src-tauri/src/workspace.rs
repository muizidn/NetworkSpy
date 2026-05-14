use std::path::PathBuf;
use std::fs;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Default)]
pub struct WorkspaceState {
    pub current_workspace_path: Option<PathBuf>,
}

pub fn get_default_app_data_dir() -> PathBuf {
    #[cfg(target_os = "macos")]
    {
        let home = std::env::var("HOME").expect("HOME env var not set");
        PathBuf::from(home).join(".network-spy")
    }
    #[cfg(not(target_os = "macos"))]
    {
        // Fallback for other OSes if needed
        let home = std::env::var("HOME").or_else(|_| std::env::var("USERPROFILE")).unwrap_or_else(|_| ".".to_string());
        PathBuf::from(home).join(".network-spy")
    }
}

pub fn get_workspace_state_path() -> PathBuf {
    get_default_app_data_dir().join("workspace_state.json")
}

pub fn load_workspace_state() -> WorkspaceState {
    let path = get_workspace_state_path();
    if path.exists() {
        let content = fs::read_to_string(path).unwrap_or_default();
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        WorkspaceState::default()
    }
}

pub fn save_workspace_state(state: &WorkspaceState) -> Result<(), Box<dyn std::error::Error>> {
    let path = get_workspace_state_path();
    let dir = path.parent().unwrap();
    if !dir.exists() {
        fs::create_dir_all(dir)?;
    }
    let content = serde_json::to_string(state)?;
    fs::write(path, content)?;
    Ok(())
}

pub fn get_active_config_dir() -> PathBuf {
    let state = load_workspace_state();
    state.current_workspace_path.unwrap_or_else(get_default_app_data_dir)
}
