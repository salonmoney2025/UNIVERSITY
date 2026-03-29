//! Course management endpoints

use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Json},
    routing::get,
    Router,
};
use serde_json::json;
use shared::models::PaginationParams;
use uuid::Uuid;

use crate::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/", get(list_courses))
        .route("/:id", get(get_course))
}

async fn list_courses(
    State(state): State<AppState>,
    Query(params): Query<PaginationParams>,
) -> impl IntoResponse {
    tracing::info!("Listing courses");

    Json(json!({
        "items": [],
        "total": 0,
        "page": params.page.unwrap_or(1),
        "page_size": params.page_size.unwrap_or(20)
    }))
}

async fn get_course(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    tracing::info!("Getting course: {}", id);

    (
        StatusCode::NOT_FOUND,
        Json(json!({"error": "Course not found"})),
    )
}
