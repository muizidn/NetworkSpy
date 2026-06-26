use serde::{Serialize, Deserialize};
use std::sync::Arc;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ComposerHeader {
    pub key: String,
    pub value: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ComposerRequest {
    pub method: String,
    pub url: String,
    pub headers: Vec<ComposerHeader>,
    pub body: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ComposerResponse {
    pub status: u16,
    pub status_text: String,
    pub headers: Vec<ComposerHeader>,
    pub body: Vec<u8>,
    pub content_type: String,
    pub timing_ms: u64,
    pub size_bytes: usize,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ComposerSavedRequest {
    pub id: String,
    pub name: String,
    pub method: String,
    pub url: String,
    pub headers: Vec<ComposerHeader>,
    pub body: Option<String>,
    pub body_type: String,
    pub timestamp: i64,
}

#[tauri::command]
pub async fn get_composer_requests(
    config: tauri::State<'_, Arc<crate::config::ConfigManager>>,
) -> Result<Vec<ComposerSavedRequest>, String> {
    Ok(config.get_composer_requests())
}

#[tauri::command]
pub async fn save_all_composer_requests(
    requests: Vec<ComposerSavedRequest>,
    config: tauri::State<'_, Arc<crate::config::ConfigManager>>,
) -> Result<(), String> {
    config.save_all_composer_requests(requests).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_composer_request(
    id: String,
    config: tauri::State<'_, Arc<crate::config::ConfigManager>>,
) -> Result<(), String> {
    config.delete_composer_request(id).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_composer_request(
    request: ComposerSavedRequest,
    config: tauri::State<'_, Arc<crate::config::ConfigManager>>,
) -> Result<(), String> {
    config.save_composer_request(request).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn send_composer_request(
    request: ComposerRequest,
) -> Result<ComposerResponse, String> {
    println!("Sending composer request");

    let client = reqwest::Client::builder()
        .danger_accept_invalid_certs(false)
        .build()
        .map_err(|e| e.to_string())?;

    let method = match request.method.to_uppercase().as_str() {
        "GET" => reqwest::Method::GET,
        "POST" => reqwest::Method::POST,
        "PUT" => reqwest::Method::PUT,
        "DELETE" => reqwest::Method::DELETE,
        "PATCH" => reqwest::Method::PATCH,
        "HEAD" => reqwest::Method::HEAD,
        "OPTIONS" => reqwest::Method::OPTIONS,
        _ => return Err(format!("Unsupported method: {}", request.method)),
    };

    let mut request_builder = client.request(method, &request.url);

    for header in &request.headers {
        if !header.key.is_empty() {
            request_builder = request_builder.header(&header.key, &header.value);
        }
    }

    if let Some(body) = &request.body {
        if !body.is_empty() {
            request_builder = request_builder.body(body.clone());
        }
    }

    let start = std::time::Instant::now();
    let response = request_builder.send().await.map_err(|e| e.to_string())?;
    let timing_ms = start.elapsed().as_millis() as u64;

    let status = response.status().as_u16();
    let status_text = response.status().canonical_reason().unwrap_or("Unknown").to_string();
    let content_type = response.headers()
        .get("content-type")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_string();

    let mut response_headers = Vec::new();
    for (key, value) in response.headers() {
        if let Ok(v) = value.to_str() {
            response_headers.push(ComposerHeader {
                key: key.to_string(),
                value: v.to_string(),
            });
        }
    }

    let body = response.bytes().await.map_err(|e| e.to_string())?.to_vec();
    let size_bytes = body.len();

    Ok(ComposerResponse {
        status,
        status_text,
        headers: response_headers,
        body,
        content_type,
        timing_ms,
        size_bytes,
    })
}
