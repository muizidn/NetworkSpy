use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, Serialize)]
pub struct BrowserInfo {
    pub name: String,
    pub path: String,
    pub running: bool,
}

fn is_browser_running(name: &str) -> bool {
    #[cfg(target_os = "macos")]
    {
        let output = std::process::Command::new("osascript")
            .args(["-e", &format!("application \"{}\" is running", name)])
            .output();
        if let Ok(out) = output {
            let stdout = String::from_utf8_lossy(&out.stdout);
            return stdout.trim() == "true";
        }
    }

    #[cfg(target_os = "windows")]
    {
        let exe_name = format!("{}.exe", name.to_lowercase().replace(' ', ""));
        let output = std::process::Command::new("tasklist")
            .args(["/fi", &format!("IMAGENAME eq {}", exe_name), "/nh"])
            .output();
        if let Ok(out) = output {
            let stdout = String::from_utf8_lossy(&out.stdout);
            return stdout.contains(&exe_name);
        }
    }

    #[cfg(target_os = "linux")]
    {
        let output = std::process::Command::new("pgrep")
            .args(["-f", name])
            .output();
        if let Ok(out) = output {
            return out.status.success();
        }
    }

    false
}

fn kill_browser_process(name: &str) {
    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("osascript")
            .args(["-e", &format!("quit app \"{}\"", name)])
            .output();
    }

    #[cfg(target_os = "windows")]
    {
        let exe_name = format!("{}.exe", name.to_lowercase().replace(' ', ""));
        let _ = std::process::Command::new("taskkill")
            .args(["/f", "/im", &exe_name])
            .output();
    }

    #[cfg(target_os = "linux")]
    {
        let _ = std::process::Command::new("pkill")
            .args(["-f", name])
            .output();
    }
}

fn open_browser(path: &str) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to launch browser: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("start")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to launch browser: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new(&path)
            .spawn()
            .map_err(|e| format!("Failed to launch browser: {}", e))?;
    }

    Ok(())
}

#[tauri::command]
pub fn launch_browser(_name: String, path: String) -> Result<(), String> {
    open_browser(&path)
}

#[tauri::command]
pub fn relaunch_browser(name: String, path: String) -> Result<(), String> {
    kill_browser_process(&name);
    std::thread::sleep(std::time::Duration::from_millis(500));
    open_browser(&path)
}

#[derive(Debug, Deserialize)]
struct BrowserEntry {
    name: String,
    path: String,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct BrowserConfig {
    macos: Vec<BrowserEntry>,
    windows: Vec<BrowserEntry>,
    linux: Vec<BrowserEntry>,
}

#[tauri::command]
pub fn get_installed_browsers() -> Vec<BrowserInfo> {
    let config: BrowserConfig = match serde_json::from_str(include_str!("../../browsers.json")) {
        Ok(c) => c,
        Err(_) => return Vec::new(),
    };

    let entries: &[BrowserEntry] = {
        #[cfg(target_os = "macos")] { &config.macos }
        #[cfg(target_os = "windows")] { &config.windows }
        #[cfg(target_os = "linux")] { &config.linux }
    };

    let mut browsers = Vec::new();

    for entry in entries {
        #[cfg(not(target_os = "linux"))]
        if std::path::Path::new(&entry.path).exists() {
            browsers.push(BrowserInfo {
                name: entry.name.clone(),
                path: entry.path.clone(),
                running: is_browser_running(&entry.name),
            });
        }

        #[cfg(target_os = "linux")]
        if let Ok(path) = std::process::Command::new("which").arg(&entry.path).output() {
            if path.status.success() {
                let path_str = String::from_utf8_lossy(&path.stdout).trim().to_string();
                if !path_str.is_empty() {
                    browsers.push(BrowserInfo {
                        name: entry.name.clone(),
                        path: path_str,
                        running: is_browser_running(&entry.name),
                    });
                }
            }
        }
    }

    browsers
}
