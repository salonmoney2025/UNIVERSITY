//! Exam and Grade models

use chrono::{DateTime, NaiveDate, NaiveTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Exam type enumeration
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "varchar", rename_all = "UPPERCASE")]
pub enum ExamType {
    #[sqlx(rename = "MIDTERM")]
    Midterm,
    #[sqlx(rename = "FINAL")]
    Final,
    #[sqlx(rename = "QUIZ")]
    Quiz,
    #[sqlx(rename = "ASSIGNMENT")]
    Assignment,
}

/// Exam status enumeration
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "varchar", rename_all = "UPPERCASE")]
pub enum ExamStatus {
    #[sqlx(rename = "SCHEDULED")]
    Scheduled,
    #[sqlx(rename = "ONGOING")]
    Ongoing,
    #[sqlx(rename = "COMPLETED")]
    Completed,
    #[sqlx(rename = "CANCELLED")]
    Cancelled,
}

/// Grade approval status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "varchar", rename_all = "UPPERCASE")]
pub enum ApprovalStatus {
    #[sqlx(rename = "DRAFT")]
    Draft,
    #[sqlx(rename = "PENDING_APPROVAL")]
    PendingApproval,
    #[sqlx(rename = "APPROVED")]
    Approved,
    #[sqlx(rename = "PUBLISHED")]
    Published,
    #[sqlx(rename = "REJECTED")]
    Rejected,
}

/// Exam entity (maps to exams_exam table)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Exam {
    pub id: Uuid,
    pub course_offering_id: Uuid,
    pub name: String,
    pub exam_type: String,
    pub date: NaiveDate,
    pub start_time: NaiveTime,
    pub end_time: NaiveTime,
    pub duration_minutes: i32,
    pub total_marks: Decimal,
    pub passing_marks: Decimal,
    pub instructions: Option<String>,
    pub venue: Option<String>,
    pub capacity: Option<i32>,
    pub status: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Grade entity (maps to exams_grade table)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Grade {
    pub id: Uuid,
    pub student_id: Uuid,
    pub exam_id: Uuid,
    pub marks_obtained: Decimal,
    pub graded_by_id: Option<Uuid>,
    pub graded_date: DateTime<Utc>,
    pub remarks: Option<String>,
    pub grade_letter: Option<String>,
    pub approval_status: String,
    pub approved_by_id: Option<Uuid>,
    pub approved_date: Option<DateTime<Utc>>,
    pub is_published: bool,
    pub published_by_id: Option<Uuid>,
    pub published_date: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// DTO for creating an exam
#[derive(Debug, Deserialize, Validate)]
pub struct CreateExamDto {
    pub course_offering_id: Uuid,

    #[validate(length(min = 2, max = 200))]
    pub name: String,

    pub exam_type: ExamType,
    pub date: NaiveDate,
    pub start_time: NaiveTime,
    pub end_time: NaiveTime,

    #[validate(range(min = 1, max = 600))]
    pub duration_minutes: i32,

    pub total_marks: Decimal,
    pub passing_marks: Decimal,
    pub instructions: Option<String>,
    pub venue: Option<String>,
    pub capacity: Option<i32>,
}

/// DTO for entering/updating a grade
#[derive(Debug, Deserialize, Validate)]
pub struct EnterGradeDto {
    pub student_id: Uuid,
    pub exam_id: Uuid,
    pub marks_obtained: Decimal,
    pub remarks: Option<String>,
}
