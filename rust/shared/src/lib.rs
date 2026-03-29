//! Shared library for EBKUST University Management System
//!
//! This crate contains:
//! - Domain models (Student, Course, Exam, etc.)
//! - Database connection and query layer (SQLx)
//! - Error types and utilities
//! - Common types and validation logic

pub mod config;
pub mod db;
pub mod errors;
pub mod models;
pub mod utils;

// Re-export commonly used types
pub use errors::{AppError, Result};
pub use config::Settings;
