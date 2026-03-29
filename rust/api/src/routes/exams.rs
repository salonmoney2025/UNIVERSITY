//! Exam management endpoints

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
        .route("/", get(list_exams))
        .route("/:id", get(get_exam))
}

async fn list_exams(
    State(state): State<AppState>,
    Query(params): Query<PaginationParams>,
) -> impl IntoResponse {
    tracing::info!("Listing exams");

    Json(json!({
        "items": [],
        "total": 0,
        "page": params.page.unwrap_or(1),
        "page_size": params.page_size.unwrap_or(20)
    }))
}

async fn get_exam(
    State(state): State<AppState>,
    Path(id): Path<Uuid>,
) -> impl IntoResponse {
    tracing::info!("Getting exam: {}", id);

    (
        StatusCode::NOT_FOUND,
        Json(json!({"error": "Exam not found"})),
    )
}
