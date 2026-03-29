//! Course and Program models

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Degree type enumeration
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "varchar", rename_all = "UPPERCASE")]
pub enum DegreeType {
    #[sqlx(rename = "BACHELOR")]
    Bachelor,
    #[sqlx(rename = "MASTER")]
    Master,
    #[sqlx(rename = "PHD")]
    Phd,
    #[sqlx(rename = "DIPLOMA")]
    Diploma,
    #[sqlx(rename = "CERTIFICATE")]
    Certificate,
}

/// Program entity (maps to courses_program table)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Program {
    pub id: Uuid,
    pub name: String,
    pub code: String,
    pub campus_id: Uuid,
    pub department_id: Uuid,
    pub degree_type: String,
    pub duration_years: i32,
    pub total_credits: i32,
    pub description: String,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Course entity (maps to courses_course table)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Course {
    pub id: Uuid,
    pub code: String,
    pub title: String,
    pub campus_id: Uuid,
    pub department_id: Uuid,
    pub credits: i32,
    pub description: String,
    pub prerequisites: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Course offering entity (maps to courses_courseoffering table)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct CourseOffering {
    pub id: Uuid,
    pub course_id: Uuid,
    pub semester: String,
    pub academic_year: String,
    pub instructor_id: Option<Uuid>,
    pub max_students: i32,
    pub enrolled_students: i32,
    pub schedule: Option<String>,
    pub venue: Option<String>,
    pub is_active: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// DTO for creating a program
#[derive(Debug, Deserialize, Validate)]
pub struct CreateProgramDto {
    #[validate(length(min = 2, max = 200))]
    pub name: String,

    #[validate(length(min = 2, max = 20))]
    pub code: String,

    pub campus_id: Uuid,
    pub department_id: Uuid,
    pub degree_type: DegreeType,

    #[validate(range(min = 1, max = 10))]
    pub duration_years: i32,

    #[validate(range(min = 1, max = 500))]
    pub total_credits: i32,

    #[validate(length(min = 10, max = 2000))]
    pub description: String,
}
