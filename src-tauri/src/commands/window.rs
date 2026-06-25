use crate::*;
use super::PROXY_TOGGLE;
use tauri::{AppHandle, Manager, Emitter};
use std::sync::atomic::Ordering;

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

pub fn open_new_window_internal(app_handle: &tauri::AppHandle, context: String, title: String) {
    let label = context.split('?').next().unwrap_or(&context).to_string();

    if let Some(window) = app_handle.get_webview_window(&label) {
        let _ = window.show();
        let _ = window.set_focus();
        return;
    }

    let url_path = std::path::PathBuf::from(&context);

    match tauri::WebviewWindowBuilder::new(
        app_handle,
        label,
        tauri::WebviewUrl::App(url_path),
    )
        .title(title.clone())
    .inner_size(1500.0, 700.0)
    .resizable(true)
    .build()
    {
        Ok(window) => {
            let _ = window.show();
            let _ = window.set_focus();
            println!("[open_new_window] Created '{}' window for '{}'", title, context);
        }
        Err(e) => {
            eprintln!("[open_new_window] Failed to create window '{}': {}", title, e);
        }
    }
}

#[tauri::command]
pub async fn open_new_window(app_handle: tauri::AppHandle, context: String, title: String) {
    open_new_window_internal(&app_handle, context, title);
}

#[tauri::command]
pub async fn trigger_menu_action(app_handle: tauri::AppHandle, action: String) {
    match action.as_str() {
        "install_cert" | "cert-installer" => {
            let h = app_handle.clone(); tauri::async_runtime::spawn(async move {
                open_new_window_internal(&h, "certificate-installer".into(), "Certificate Installer".into());
            });
        }
        "saved_sessions" => {
            let h = app_handle.clone(); tauri::async_runtime::spawn(async move {
                open_new_window_internal(&h, "sessions".into(), "Saved Sessions".into());
            });
        }
        "traffic_filters" => {
            let h = app_handle.clone(); tauri::async_runtime::spawn(async move {
                open_new_window_internal(&h, "filters".into(), "Traffic Filters".into());
            });
        }
        "tools_tag" => {
            let h = app_handle.clone(); tauri::async_runtime::spawn(async move {
                open_new_window_internal(&h, "tag".into(), "Tag Tools".into());
            });
        }
        "proxylist" => {
            let h = app_handle.clone(); tauri::async_runtime::spawn(async move {
                open_new_window_internal(&h, "proxylist".into(), "Proxy Intercept Rules".into());
            });
        }
        "breakpoints" => {
            let h = app_handle.clone(); tauri::async_runtime::spawn(async move {
                open_new_window_internal(&h, "breakpoint".into(), "Traffic Breakpoints".into());
            });
        }
        "map_local" => {
            let h = app_handle.clone(); tauri::async_runtime::spawn(async move {
                open_new_window_internal(&h, "map-local".into(), "Map Local Rules".into());
            });
        }
        "map_remote" => {
            let h = app_handle.clone(); tauri::async_runtime::spawn(async move {
                open_new_window_internal(&h, "map-remote".into(), "Map Remote Rules".into());
            });
        }
        "scripting" => {
            let h = app_handle.clone(); tauri::async_runtime::spawn(async move {
                open_new_window_internal(&h, "scripting".into(), "Custom Scripting".into());
            });
        }
        "composer" => {
            let h = app_handle.clone(); tauri::async_runtime::spawn(async move {
                open_new_window_internal(&h, "composer".into(), "Composer".into());
            });
        }
        "check_updates" => {
            let _ = app_handle.emit("check-for-updates", ());
        }
        "toggle_capture" => {
            if let Some(toggle) = PROXY_TOGGLE.get() {
                if toggle.is_on() {
                    toggle.turn_off();
                    let _ = app_handle.emit("proxy-status", false);
                } else {
                    let port = ACTUAL_PORT.load(Ordering::SeqCst) as u64;
                    toggle.turn_on(port);
                    let _ = app_handle.emit("proxy-status", true);
                }
            }
        }
        "clear_traffic" => {
            let _ = app_handle.emit("menu-clear-traffic", ());
        }
        "save_capture" => {
            let _ = app_handle.emit("menu-save-capture", ());
        }
        "show" => {
            if let Some(window) = app_handle.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
        "reload" => {
            if let Some(window) = app_handle.get_webview_window("main") {
                let _ = window.eval("window.location.reload()");
            }
        }
        "quit" => {
            if let Some(toggle) = PROXY_TOGGLE.get() {
                toggle.turn_off();
            }
            app_handle.exit(0);
        }
        _ => {}
    }
}

pub fn handle_tray_menu_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
    match event.id.as_ref() {
        "quit" => {
            if let Some(toggle) = PROXY_TOGGLE.get() {
                toggle.turn_off();
            }
            app.exit(0);
        }
        "show" => {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
        "reset_proxy" => {
            if let Some(toggle) = PROXY_TOGGLE.get() {
                toggle.turn_off();
            }
        }
        _ => {}
    }
}

#[tauri::command]
pub fn get_app_data_dir() -> std::path::PathBuf {
    use std::env;
    let home = env::var("HOME").or_else(|_| env::var("USERPROFILE")).unwrap_or_else(|_| ".".to_string());
    std::path::PathBuf::from(home).join(".network-spy")
}
