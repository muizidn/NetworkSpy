use rusqlite::{params, Connection};
pub use crate::traffic::db::MapLocalRule;

pub fn create_table(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS map_local_rules (
            id TEXT PRIMARY KEY,
            enabled INTEGER NOT NULL,
            name TEXT NOT NULL,
            method TEXT NOT NULL,
            matching_rule TEXT NOT NULL,
            local_path TEXT NOT NULL
        )",
        [],
    )?;
    Ok(())
}

pub fn get_all(conn: &Connection) -> rusqlite::Result<Vec<MapLocalRule>> {
    let mut stmt = conn.prepare("SELECT id, enabled, name, method, matching_rule, local_path FROM map_local_rules")?;
    let rows = stmt.query_map([], |row| {
        Ok(MapLocalRule {
            id: row.get(0)?,
            enabled: row.get::<_, i32>(1)? != 0,
            name: row.get(2)?,
            method: row.get(3)?,
            matching_rule: row.get(4)?,
            local_path: row.get(5)?,
        })
    })?;

    let mut rules = Vec::new();
    for row in rows {
        rules.push(row?);
    }
    Ok(rules)
}

pub fn save(conn: &Connection, rule: &MapLocalRule) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO map_local_rules (id, enabled, name, method, matching_rule, local_path) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
         ON CONFLICT(id) DO UPDATE SET
            enabled = excluded.enabled,
            name = excluded.name,
            method = excluded.method,
            matching_rule = excluded.matching_rule,
            local_path = excluded.local_path",
        params![rule.id, if rule.enabled { 1 } else { 0 }, rule.name, rule.method, rule.matching_rule, rule.local_path],
    )?;
    Ok(())
}

pub fn delete(conn: &Connection, id: String) -> rusqlite::Result<()> {
    conn.execute(
        "DELETE FROM map_local_rules WHERE id = ?1",
        params![id],
    )?;
    Ok(())
}
