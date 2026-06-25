use crate::*;
use crate::traffic::db::TrafficDb;
use std::sync::Arc;

#[tauri::command]
pub async fn repeat_request(
    db: tauri::State<'_, Arc<TrafficDb>>,
    traffic_id: String,
) -> Result<(), String> {
    let req_data = db.get_request_data(&traffic_id).ok_or("Request data not found")?;
    let meta = db.get_traffic_metadata(traffic_id).map_err(|e| e.to_string())?.ok_or("Metadata not found")?;

    let client = reqwest::Client::new();
    let method = match meta.method.as_deref() {
        Some("GET") => reqwest::Method::GET,
        Some("POST") => reqwest::Method::POST,
        Some("PUT") => reqwest::Method::PUT,
        Some("DELETE") => reqwest::Method::DELETE,
        Some("PATCH") => reqwest::Method::PATCH,
        Some("HEAD") => reqwest::Method::HEAD,
        Some("OPTIONS") => reqwest::Method::OPTIONS,
        _ => reqwest::Method::GET,
    };

    let mut request_builder = client.request(method, meta.uri.ok_or("URI not found")?);

    for (key, value) in req_data.headers {
        let key_lower = key.to_lowercase();
        if key_lower == "content-length" || key_lower == "host" || key_lower == "connection" {
            continue;
        }
        request_builder = request_builder.header(key, value);
    }

    if !req_data.body.is_empty() {
        request_builder = request_builder.body(req_data.body);
    }

    tokio::spawn(async move {
        let _ = request_builder.send().await;
    });

    Ok(())
}

#[tauri::command]
pub async fn repeat_request_with_data(
    data: BreakpointData,
) -> Result<(), String> {
    let client = reqwest::Client::new();
    let method = match data.method.as_deref() {
        Some("GET") => reqwest::Method::GET,
        Some("POST") => reqwest::Method::POST,
        Some("PUT") => reqwest::Method::PUT,
        Some("DELETE") => reqwest::Method::DELETE,
        Some("PATCH") => reqwest::Method::PATCH,
        Some("HEAD") => reqwest::Method::HEAD,
        Some("OPTIONS") => reqwest::Method::OPTIONS,
        _ => reqwest::Method::GET,
    };

    let mut request_builder = client.request(method, data.uri.ok_or("URI not found")?);

    for (key, value) in data.headers {
        let key_lower = key.to_lowercase();
        if key_lower == "content-length" || key_lower == "host" || key_lower == "connection" {
            continue;
        }
        request_builder = request_builder.header(key, value);
    }

    if !data.body.is_empty() {
        request_builder = request_builder.body(data.body);
    }

    tokio::spawn(async move {
        let _ = request_builder.send().await;
    });

    Ok(())
}
