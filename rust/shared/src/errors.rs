//! Error types for the application

use std::fmt;

/// Application result type
pub type Result<T> = std::result::Result<T, AppError>;

/// Main application error type
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    /// Database errors
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    /// Not found errors
    #[error("Resource not found: {0}")]
    NotFound(String),

    /// Validation errors
    #[error("Validation error: {0}")]
    Validation(String),

    /// Authentication errors
    #[error("Authentication error: {0}")]
    Auth(String),

    /// Authorization errors
    #[error("Authorization error: {0}")]
    Authorization(String),

    /// Configuration errors
    #[error("Configuration error: {0}")]
    Config(String),

    /// Internal server errors
    #[error("Internal server error: {0}")]
    Internal(String),
}

impl AppError {
    pub fn not_found<S: Into<String>>(msg: S) -> Self {
        Self::NotFound(msg.into())
    }

    pub fn validation<S: Into<String>>(msg: S) -> Self {
        Self::Validation(msg.into())
    }

    pub fn auth<S: Into<String>>(msg: S) -> Self {
        Self::Auth(msg.into())
    }

    pub fn internal<S: Into<String>>(msg: S) -> Self {
        Self::Internal(msg.into())
    }
}

impl From<validator::ValidationErrors> for AppError {
    fn from(err: validator::ValidationErrors) -> Self {
        AppError::Validation(err.to_string())
    }
}

impl From<config::ConfigError> for AppError {
    fn from(err: config::ConfigError) -> Self {
        AppError::Config(err.to_string())
    }
}
