use super::{CERTIFICATE_INSTALLER, get_app_data_dir};
use crate::settings::ManagedProxySettings;

#[tauri::command]
pub fn install_certificate(app: tauri::AppHandle, state: tauri::State<'_, ManagedProxySettings>, cert_path: String) -> Result<String, String> {
    println!("INSTALL CERTIFICATE");
    let stream_logs = state.0.read()
        .map(|s| s.stream_certificate_logs)
        .unwrap_or(false);
    CERTIFICATE_INSTALLER.get().unwrap().install(Some(app), stream_logs, cert_path)
}

#[tauri::command]
pub fn auto_install_certificate(app: tauri::AppHandle, state: tauri::State<'_, ManagedProxySettings>) -> Result<String, String> {
    let app_data_dir = get_app_data_dir();
    let cert_path = app_data_dir.join("ca").join("network-spy.crt");

    if !cert_path.exists() {
        return Err(format!("Certificate file not found at: {}. Please restart the application.", cert_path.display()));
    }

    let cert_content = std::fs::read_to_string(cert_path).map_err(|e| e.to_string())?;
    let stream_logs = state.0.read()
        .map(|s| s.stream_certificate_logs)
        .unwrap_or(false);
    CERTIFICATE_INSTALLER.get().unwrap().install_from_content(Some(app), stream_logs, &cert_content)
}

#[tauri::command]
pub fn uninstall_certificate(app: tauri::AppHandle, state: tauri::State<'_, ManagedProxySettings>) -> Result<String, String> {
    let stream_logs = state.0.read()
        .map(|s| s.stream_certificate_logs)
        .unwrap_or(false);
    CERTIFICATE_INSTALLER.get().unwrap().uninstall(Some(app), stream_logs)
}
