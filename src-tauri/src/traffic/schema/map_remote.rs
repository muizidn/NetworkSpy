use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MapRemoteRule {
    pub id: Option<i64>,
    pub name: String,
    pub matching_rule: String,
    pub method: String,
    pub remote_url: String,
    pub enabled: bool,
}

pub fn create_table(conn: &Connection) -> Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS map_remote_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            matching_rule TEXT NOT NULL,
            method TEXT NOT NULL,
            remote_url TEXT NOT NULL,
            enabled BOOLEAN NOT NULL DEFAULT 1
        )",
        [],
    )?;
    Ok(())
}

pub fn get_all(conn: &Connection) -> Result<Vec<MapRemoteRule>> {
    let mut stmt = conn.prepare("SELECT id, name, matching_rule, method, remote_url, enabled FROM map_remote_rules")?;
    let rows = stmt.query_map([], |row| {
        Ok(MapRemoteRule {
            id: Some(row.get(0)?),
            name: row.get(1)?,
            matching_rule: row.get(2)?,
            method: row.get(3)?,
            remote_url: row.get(4)?,
            enabled: row.get(5)?,
        })
    })?;

    let mut rules = Vec::new();
    for row in rows {
        rules.push(row?);
    }
    Ok(rules)
}

pub fn save(conn: &Connection, rule: &MapRemoteRule) -> Result<()> {
    if let Some(id) = rule.id {
        conn.execute(
            "UPDATE map_remote_rules SET name = ?1, matching_rule = ?2, method = ?3, remote_url = ?4, enabled = ?5 WHERE id = ?6",
            params![rule.name, rule.matching_rule, rule.method, rule.remote_url, rule.enabled, id],
        )?;
    } else {
        conn.execute(
            "INSERT INTO map_remote_rules (name, matching_rule, method, remote_url, enabled) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![rule.name, rule.matching_rule, rule.method, rule.remote_url, rule.enabled],
        )?;
    }
    Ok(())
}

pub fn delete(conn: &Connection, id: i64) -> Result<()> {
    conn.execute("DELETE FROM map_remote_rules WHERE id = ?1", params![id])?;
    Ok(())
}
