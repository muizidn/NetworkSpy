pub mod traffic;
pub mod breakpoints;
pub mod scripts;
pub mod tags;
pub mod filter_presets;
pub mod settings;
pub mod map_local;
pub mod map_remote;

use rusqlite::Connection;

pub fn init_all_tables(conn: &Connection) -> rusqlite::Result<()> {
    traffic::create_table(conn)?;
    tags::create_table(conn)?;
    Ok(())
}
