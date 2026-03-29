//! Student domain models matching Django Student app

use chrono::{DateTime, NaiveDate, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;
use validator::Validate;

/// Student enrollment status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "varchar", rename_all = "UPPERCASE")]
pub enum EnrollmentStatus {
    #[sqlx(rename = "ACTIVE")]
    Active,
    #[sqlx(rename = "SUSPENDED")]
    Suspended,
    #[sqlx(rename = "GRADUATED")]
    Graduated,
    #[sqlx(rename = "WITHDRAWN")]
    Withdrawn,
    #[sqlx(rename = "DEFERRED")]
    Deferred,
}

/// Blood group types
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum BloodGroup {
    #[serde(rename = "A+")]
    APositive,
    #[serde(rename = "A-")]
    ANegative,
    #[serde(rename = "B+")]
    BPositive,
    #[serde(rename = "B-")]
    BNegative,
    #[serde(rename = "AB+")]
    ABPositive,
    #[serde(rename = "AB-")]
    ABNegative,
    #[serde(rename = "O+")]
    OPositive,
    #[serde(rename = "O-")]
    ONegative,
}

/// Student entity (maps to students_student table)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Student {
    pub id: Uuid,
    pub student_id: String,
    pub user_id: Uuid,
    pub campus_id: Uuid,
    pub department_id: Uuid,
    pub program_id: Uuid,
    pub admission_date: NaiveDate,
    pub enrollment_status: String, // We'll parse this to EnrollmentStatus
    pub current_semester: i32,
    pub gpa: Decimal,
    pub guardian_name: String,
    pub guardian_phone: String,
    pub guardian_email: Option<String>,
    pub medical_info: Option<String>,
    pub blood_group: Option<String>,
    pub address: String,
    pub emergency_contact: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub is_deleted: bool,
}

/// DTO for creating a student
#[derive(Debug, Deserialize, Validate)]
pub struct CreateStudentDto {
    pub user_id: Uuid,
    pub campus_id: Uuid,
    pub department_id: Uuid,
    pub program_id: Uuid,
    pub admission_date: NaiveDate,

    #[validate(length(min = 2, max = 200))]
    pub guardian_name: String,

    #[validate(length(min = 9, max = 17))]
    pub guardian_phone: String,

    #[validate(email)]
    pub guardian_email: Option<String>,

    pub medical_info: Option<String>,
    pub blood_group: Option<String>,

    #[validate(length(min = 10, max = 500))]
    pub address: String,

    #[validate(length(min = 9, max = 17))]
    pub emergency_contact: String,
}

/// Course enrollment status
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CourseEnrollmentStatus {
    Enrolled,
    Completed,
    Dropped,
    Failed,
}

/// Enrollment entity (maps to students_enrollment table)
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Enrollment {
    pub id: Uuid,
    pub student_id: Uuid,
    pub course_offering_id: Uuid,
    pub semester: String,
    pub academic_year: String,
    pub enrollment_date: NaiveDate,
    pub status: String,
    pub grade: Option<String>,
    pub grade_points: Option<Decimal>,
    pub credits_earned: Option<Decimal>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
