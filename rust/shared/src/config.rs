//! Configuration management

use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct Settings {
    pub database: DatabaseSettings,
    pub server: ServerSettings,
    pub jwt: JwtSettings,
    pub rabbitmq: RabbitMQSettings,
}

#[derive(Debug, Clone, Deserialize)]
pub struct DatabaseSettings {
    pub url: String,
    pub max_connections: u32,
    pub min_connections: u32,
    pub connect_timeout_seconds: u64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct ServerSettings {
    pub host: String,
    pub port: u16,
}

#[derive(Debug, Clone, Deserialize)]
pub struct JwtSettings {
    pub secret: String,
    pub expiration_hours: i64,
}

#[derive(Debug, Clone, Deserialize)]
pub struct RabbitMQSettings {
    pub url: String,
    pub exchange: String,
}

impl Settings {
    pub fn load() -> Result<Self, config::ConfigError> {
        dotenvy::dotenv().ok();

        let settings = config::Config::builder()
            .set_default("server.host", "0.0.0.0")?
            .set_default("server.port", 8081)?
            .set_default("database.max_connections", 10)?
            .set_default("database.min_connections", 2)?
            .set_default("database.connect_timeout_seconds", 30)?
            .set_default("jwt.expiration_hours", 24)?
            .set_default("rabbitmq.exchange", "ums")?
            // Override with environment variables
            .add_source(config::Environment::with_prefix("UMS").separator("__"))
            .build()?;

        settings.try_deserialize()
    }
}
