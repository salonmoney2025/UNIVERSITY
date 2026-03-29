//! Common types used across models

use serde::{Deserialize, Serialize};
use validator::Validate;

/// Pagination parameters for list endpoints
#[derive(Debug, Clone, Deserialize, Validate)]
pub struct PaginationParams {
    #[validate(range(min = 1, max = 1000))]
    pub page: Option<u32>,

    #[validate(range(min = 1, max = 100))]
    pub page_size: Option<u32>,
}

impl Default for PaginationParams {
    fn default() -> Self {
        Self {
            page: Some(1),
            page_size: Some(20),
        }
    }
}

impl PaginationParams {
    pub fn offset(&self) -> u32 {
        let page = self.page.unwrap_or(1);
        let page_size = self.page_size.unwrap_or(20);
        (page - 1) * page_size
    }

    pub fn limit(&self) -> u32 {
        self.page_size.unwrap_or(20)
    }
}

/// Paginated response wrapper
#[derive(Debug, Serialize)]
pub struct PaginatedResponse<T> {
    pub items: Vec<T>,
    pub total: u32,
    pub page: u32,
    pub page_size: u32,
    pub total_pages: u32,
}

impl<T> PaginatedResponse<T> {
    pub fn new(items: Vec<T>, total: u32, page: u32, page_size: u32) -> Self {
        let total_pages = (total + page_size - 1) / page_size;
        Self {
            items,
            total,
            page,
            page_size,
            total_pages,
        }
    }
}
