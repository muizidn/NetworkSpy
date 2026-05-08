use std::sync::atomic::AtomicBool;

pub struct MapRemoteManager {
    pub is_enabled: AtomicBool,
}

impl MapRemoteManager {
    pub fn new() -> Self {
        Self {
            is_enabled: AtomicBool::new(false),
        }
    }
}
