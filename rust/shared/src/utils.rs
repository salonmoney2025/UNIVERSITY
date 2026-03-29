//! Utility functions and helpers

use chrono::{DateTime, Utc};
use uuid::Uuid;

/// Generate a unique student ID
/// Format: STU-YYYY-XXXXXX (e.g., STU-2025-000123)
pub fn generate_student_id(sequence: u32) -> String {
    let year = Utc::now().format("%Y");
    format!("STU-{}-{:06}", year, sequence)
}

/// Generate a unique exam ID
pub fn generate_exam_id() -> String {
    format!("EXM-{}", Uuid::new_v4().simple())
}

/// Calculate GPA from list of grades
pub fn calculate_gpa(grades: &[(String, i32)]) -> f64 {
    if grades.is_empty() {
        return 0.0;
    }

    let mut total_grade_points = 0.0;
    let mut total_credits = 0;

    for (grade, credits) in grades {
        let grade_point = match grade.as_str() {
            "A" => 4.0,
            "B" => 3.0,
            "C" => 2.0,
            "D" => 1.0,
            "F" => 0.0,
            _ => continue,
        };

        total_grade_points += grade_point * (*credits as f64);
        total_credits += credits;
    }

    if total_credits == 0 {
        0.0
    } else {
        total_grade_points / (total_credits as f64)
    }
}

/// Hash a password using Argon2
pub fn hash_password(password: &str) -> Result<String, argon2::password_hash::Error> {
    use argon2::{
        password_hash::{PasswordHasher, SaltString},
        Argon2,
    };
    use rand_core::OsRng;

    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2.hash_password(password.as_bytes(), &salt)?;
    Ok(password_hash.to_string())
}

/// Verify a password against a hash
pub fn verify_password(password: &str, hash: &str) -> Result<bool, argon2::password_hash::Error> {
    use argon2::{
        password_hash::{PasswordHash, PasswordVerifier},
        Argon2,
    };

    let parsed_hash = PasswordHash::new(hash)?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_student_id() {
        let id = generate_student_id(123);
        assert!(id.starts_with("STU-"));
        assert_eq!(id.len(), 16); // STU-2025-000123
    }

    #[test]
    fn test_calculate_gpa() {
        let grades = vec![
            ("A".to_string(), 3),
            ("B".to_string(), 4),
            ("C".to_string(), 3),
        ];
        let gpa = calculate_gpa(&grades);
        assert!((gpa - 2.9).abs() < 0.1);
    }

    #[test]
    fn test_password_hashing() {
        let password = "test_password_123";
        let hash = hash_password(password).unwrap();
        assert!(verify_password(password, &hash).unwrap());
        assert!(!verify_password("wrong_password", &hash).unwrap());
    }
}
