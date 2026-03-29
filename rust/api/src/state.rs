//! Application state shared across handlers

use sqlx::PgPool;
use shared::Settings;

/// Application state available to all route handlers
#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub settings: Settings,
}

impl AppState {
    pub fn new(pool: PgPool, settings: Settings) -> Self {
        Self { pool, settings }
    }
}
