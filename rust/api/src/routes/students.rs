//! Student management endpoints

use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Json},
    routing::{get, post},
    Router,
};
use serde_json::json;
use shared::models::{PaginationParams, Student};
use uuid::Uuid;

use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_students).post(create_student))
        .route("/:id", get(get_student))
}

/// GET /api/v2/students - List all students with pagination
async fn list_students(
    State(state): State<AppState>,
    Query(params): Query<PaginationParams>,
) -> impl IntoResponse {
    tracing::info!("Listing students: page={:?}, page_size={:?}", params.page, params.page_size);

    // TODO: Implement database query
    // For now, return empty list
    Json(json!({
        "items": [],
        "total": 0,
        "page": params.page.unwrap_or(1),
        "page_size": params.page_size.unwrap_or(20),
        "total_pages": 0
    }))
}

/// GET /api/v2/students/:id - Get a specific student
async fn get_student(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    tracing::info!("Getting student: {}", id);

    // TODO: Implement database query
    // For now, return 404
    (
        StatusCode::NOT_FOUND,
        Json(json!({
            "error": "Student not found",
            "id": id
        })),
    )
}

/// POST /api/v2/students - Create a new student
async fn create_student(
    State(state): State<AppState>,
    Json(payload): Json<serde_json::Value>,
) -> impl IntoResponse {
    tracing::info!("Creating student: {:?}", payload);

    // TODO: Implement student creation
    // For now, return 501 Not Implemented
    (
        StatusCode::NOT_IMPLEMENTED,
        Json(json!({
            "message": "Student creation not yet implemented"
        })),
    )
}
