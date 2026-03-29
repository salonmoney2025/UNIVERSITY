//! Axum API Server for EBKUST University Management System
//!
//! This service provides REST API endpoints as /api/v2/*
//! It runs alongside the Django backend without replacing it.

use axum::{
    http::StatusCode,
    response::{IntoResponse, Json},
    routing::get,
    Router,
};
use serde_json::json;
use std::net::SocketAddr;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod routes;
mod state;

use shared::{db::create_pool, Settings};
use state::AppState;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "api=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("🦀 Starting Rust API server...");

    // Load configuration
    let settings = Settings::load().map_err(|e| {
        tracing::error!("Failed to load settings: {}", e);
        e
    })?;

    // Create database connection pool
    tracing::info!("Connecting to PostgreSQL database...");
    let pool = create_pool(&settings.database).await.map_err(|e| {
        tracing::error!("Failed to create database pool: {}", e);
        e
    })?;

    // Test database connection
    shared::db::test_connection(&pool).await.map_err(|e| {
        tracing::error!("Database connection test failed: {}", e);
        e
    })?;
    tracing::info!("✅ Database connection successful");

    // Create application state
    let app_state = AppState::new(pool, settings.clone());

    // Build router
    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        // API v2 routes
        .nest("/api/v2/students", routes::students::router())
        .nest("/api/v2/courses", routes::courses::router())
        .nest("/api/v2/exams", routes::exams::router())
        // State and middleware
        .with_state(app_state)
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        )
        .layer(TraceLayer::new_for_http());

    // Start server
    let addr = SocketAddr::from((
        settings.server.host.parse::<std::net::IpAddr>()?,
        settings.server.port,
    ));

    tracing::info!("🚀 Rust API listening on http://{}", addr);
    tracing::info!("📝 API endpoints available at /api/v2/*");

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

/// Root endpoint
async fn root() -> impl IntoResponse {
    Json(json!({
        "service": "EBKUST University Management System - Rust API",
        "version": "0.1.0",
        "status": "operational",
        "documentation": {
            "students": "/api/v2/students",
            "courses": "/api/v2/courses",
            "exams": "/api/v2/exams"
        }
    }))
}

/// Health check endpoint
async fn health_check(state: axum::extract::State<AppState>) -> impl IntoResponse {
    match shared::db::test_connection(&state.pool).await {
        Ok(_) => (
            StatusCode::OK,
            Json(json!({
                "status": "healthy",
                "database": "connected"
            })),
        ),
        Err(e) => (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(json!({
                "status": "unhealthy",
                "database": "disconnected",
                "error": e.to_string()
            })),
        ),
    }
}
