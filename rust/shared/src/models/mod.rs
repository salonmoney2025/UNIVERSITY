//! Domain models matching Django ORM structure

pub mod student;
pub mod course;
pub mod exam;
pub mod common;

// Re-export commonly used models
pub use student::{Student, Enrollment, EnrollmentStatus};
pub use course::{Program, Course, CourseOffering, DegreeType};
pub use exam::{Exam, Grade, ExamType, ExamStatus, ApprovalStatus};
pub use common::{PaginationParams, PaginatedResponse};
