use std::sync::atomic::AtomicBool;

pub struct MapLocalManager {
    pub is_enabled: AtomicBool,
}

impl MapLocalManager {
    pub fn new() -> Self {
        Self {
            is_enabled: AtomicBool::new(true),
        }
    }
}
