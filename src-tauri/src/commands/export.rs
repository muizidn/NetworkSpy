use crate::traffic::db::{TrafficDb, TrafficEvent, is_text_content_type, body_to_string};
use crate::traffic::har_util::{create_har_log, HarLog};
use crate::*;
use base64::{Engine as _, engine::general_purpose};
use std::fs;
use rusqlite::params;
use std::collections::HashMap;
use tauri::{AppHandle, Emitter};
use std::sync::Arc;

#[tauri::command]
pub async fn save_session(path: String, db: tauri::State<'_, Arc<TrafficDb>>) -> Result<(), String> {
    let data = db.get_all_traffic_with_bodies().map_err(|e: rusqlite::Error| e.to_string())?;
    let har = create_har_log(data);
    let json = serde_json::to_string_pretty(&har).map_err(|e: serde_json::Error| e.to_string())?;
    fs::write(path, json).map_err(|e: std::io::Error| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn export_selected_to_har(path: String, ids: Vec<String>, db: tauri::State<'_, Arc<TrafficDb>>) -> Result<(), String> {
    let data = db.get_traffic_with_bodies_by_ids(ids).map_err(|e: rusqlite::Error| e.to_string())?;
    let har = create_har_log(data);
    let json = serde_json::to_string_pretty(&har).map_err(|e: serde_json::Error| e.to_string())?;
    fs::write(path, json).map_err(|e: std::io::Error| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn export_selected_to_csv(path: String, ids: Vec<String>, db: tauri::State<'_, Arc<TrafficDb>>) -> Result<(), String> {
    let data = db.get_traffic_with_bodies_by_ids(ids).map_err(|e: rusqlite::Error| e.to_string())?;
    let mut csv_content = String::from("ID,Timestamp,Method,URI,Status,Client,RequestBody,ResponseBody\n");

    for (meta, req_body, res_body, req_ct, _, res_ct, _) in data {
        let uri = meta.uri.unwrap_or_default().replace('\"', "\"\"");
        let client = meta.client.unwrap_or_default().replace('\"', "\"\"");
        let req_s = body_to_string(&req_body, &req_ct).replace('\"', "\"\"");
        let res_s = body_to_string(&res_body, &res_ct).replace('\"', "\"\"");

        let line = format!(
            "{},\"{}\",{},\"{}\",{},\"{}\",\"{}\",\"{}\"\n",
            meta.id,
            meta.timestamp,
            meta.method.unwrap_or_default(),
            uri,
            meta.status_code.unwrap_or(0),
            client,
            req_s,
            res_s
        );
        csv_content.push_str(&line);
    }

    fs::write(path, csv_content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn export_selected_to_sqlite(path: String, ids: Vec<String>, db: tauri::State<'_, Arc<TrafficDb>>) -> Result<(), String> {
    let data = db.get_traffic_with_bodies_by_ids(ids).map_err(|e: rusqlite::Error| e.to_string())?;

    let conn = rusqlite::Connection::open(&path).map_err(|e| e.to_string())?;

    conn.execute_batch(
        "CREATE TABLE traffic (
            id TEXT PRIMARY KEY,
            uri TEXT,
            method TEXT,
            version TEXT,
            client TEXT,
            req_headers TEXT,
            res_headers TEXT,
            status_code INTEGER,
            intercepted INTEGER,
            timestamp DATETIME
        );
        CREATE TABLE body (
            traffic_id TEXT PRIMARY KEY,
            req_body BLOB,
            res_body BLOB,
            req_body_text TEXT,
            res_body_text TEXT,
            req_content_type TEXT,
            res_content_type TEXT
        );"
    ).map_err(|e| e.to_string())?;

    {
        let mut ins_traffic = conn.prepare("INSERT INTO traffic (id, uri, method, version, client, req_headers, res_headers, status_code, intercepted, timestamp) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)").map_err(|e| e.to_string())?;
        let mut ins_body = conn.prepare("INSERT INTO body (traffic_id, req_body, res_body, req_body_text, res_body_text, req_content_type, res_content_type) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)").map_err(|e| e.to_string())?;

        for (meta, req_body, res_body, req_ct, _, res_ct, _) in data {
            ins_traffic.execute(params![
                meta.id, meta.uri, meta.method, meta.version, meta.client, meta.req_headers, meta.res_headers, meta.status_code, if meta.intercepted { 1 } else { 0 }, meta.timestamp
            ]).map_err(|e| e.to_string())?;

            let req_text = if is_text_content_type(&req_ct) { Some(body_to_string(&req_body, &req_ct)) } else { None };
            let res_text = if is_text_content_type(&res_ct) { Some(body_to_string(&res_body, &res_ct)) } else { None };

            ins_body.execute(params![
                meta.id, req_body, res_body, req_text, res_text, req_ct, res_ct
            ]).map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn load_session(path: String, db: tauri::State<'_, Arc<TrafficDb>>, app_handle: AppHandle) -> Result<(), String> {
    let json = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let har: HarLog = serde_json::from_str(&json).map_err(|e| e.to_string())?;

    db.clear_all().map_err(|e: rusqlite::Error| e.to_string())?;
    app_handle.emit("traffic_cleared", ()).map_err(|e| e.to_string())?;
    std::thread::sleep(std::time::Duration::from_millis(100));

    let entries_count = har.log.entries.len();
    println!("Importing {} entries from HAR", entries_count);

    for (i, entry) in har.log.entries.into_iter().enumerate() {
        if i % 10 == 0 {
            std::thread::sleep(std::time::Duration::from_millis(1));
        }
        let timestamp = entry.started_date_time.clone();
        let id = format!("har_{}_{}", timestamp, i);

        let mut req_headers = HashMap::new();
        for h in entry.request.headers {
            req_headers.insert(h.name.clone(), h.value);
        }

        let method = entry.request.method.clone();
        let url = entry.request.url.clone();
        let version = entry.request.http_version.clone();
        let body_size = entry.request.body_size as usize;

        let req_body = if let Some(post) = entry.request.post_data {
            post.text.into_bytes()
        } else {
            vec![]
        };

        let content_type = req_headers.get("content-type").or_else(|| req_headers.get("Content-Type")).cloned();
        let content_encoding = req_headers.get("content-encoding").or_else(|| req_headers.get("Content-Encoding")).cloned();

        db.insert_request(TrafficEvent::Request {
            id: id.clone(),
            uri: url.clone(),
            method: method.clone(),
            version: version.clone(),
            headers: req_headers.clone(),
            body: req_body,
            content_type,
            content_encoding,
            intercepted: true,
            client: "HAR Import".to_string(),
            tags: vec![],
        });

        let _ = app_handle.emit("traffic_event", Payload {
            id: id.clone(),
            is_request: true,
            data: PayloadTraffic {
                uri: Some(url),
                version: Some(version.clone()),
                method: Some(method),
                headers: req_headers,
                body_size,
                intercepted: true,
                status_code: None,
                client: Some("HAR Import".to_string()),
                tags: vec![],
            }
        });

        let mut res_headers = HashMap::new();
        for h in entry.response.headers {
            res_headers.insert(h.name.clone(), h.value);
        }

        let res_body = if let Some(text) = entry.response.content.text {
            if entry.response.content.encoding.as_deref() == Some("base64") {
                general_purpose::STANDARD.decode(text).unwrap_or_default()
            } else {
                text.into_bytes()
            }
        } else {
            vec![]
        };

        let status_code = entry.response.status;
        let res_body_size = entry.response.content.size;

        let content_type = res_headers.get("content-type").or_else(|| res_headers.get("Content-Type")).cloned();
        let content_encoding = res_headers.get("content-encoding").or_else(|| res_headers.get("Content-Encoding")).cloned();

        db.insert_response(TrafficEvent::Response {
            id: id.clone(),
            headers: res_headers.clone(),
            body: res_body,
            content_type,
            content_encoding,
            status_code,
        });

        let _ = app_handle.emit("traffic_event", Payload {
            id: id.clone(),
            is_request: false,
            data: PayloadTraffic {
                uri: None,
                version: Some(entry.response.http_version.clone()),
                method: None,
                headers: res_headers,
                body_size: res_body_size,
                intercepted: true,
                status_code: Some(status_code),
                client: Some("HAR Import".to_string()),
                tags: vec![],
            }
        });
    }

    Ok(())
}
