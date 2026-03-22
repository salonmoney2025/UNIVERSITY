"""
Common utility functions for the University LMS.
"""
import random
import string
from typing import Any, Dict


def generate_random_string(length: int = 8) -> str:
    """Generate a random string of specified length."""
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))


def generate_student_id(prefix: str = "STU") -> str:
    """Generate a unique student ID."""
    timestamp = str(int(time.time()))[-6:]
    random_part = generate_random_string(4).upper()
    return f"{prefix}{timestamp}{random_part}"


def generate_staff_id(prefix: str = "STF") -> str:
    """Generate a unique staff ID."""
    timestamp = str(int(time.time()))[-6:]
    random_part = generate_random_string(4).upper()
    return f"{prefix}{timestamp}{random_part}"


def format_phone_number(phone: str) -> str:
    """Format phone number to international format."""
    # Remove all non-numeric characters
    phone = ''.join(filter(str.isdigit, phone))

    # Add country code if not present (assuming Nigeria +234)
    if not phone.startswith('234') and len(phone) == 10:
        phone = '234' + phone[1:] if phone.startswith('0') else '234' + phone

    return phone


def calculate_cgpa(grades: list) -> float:
    """Calculate CGPA from list of grade points."""
    if not grades:
        return 0.0
    return round(sum(grades) / len(grades), 2)


def calculate_gpa(course_grades: Dict[str, Any]) -> float:
    """
    Calculate GPA from course grades.

    Args:
        course_grades: Dict with course_code as key and dict with 'grade' and 'units' as value

    Returns:
        Calculated GPA
    """
    total_points = 0
    total_units = 0

    for course_code, data in course_grades.items():
        grade_point = data.get('grade', 0)
        units = data.get('units', 0)
        total_points += grade_point * units
        total_units += units

    if total_units == 0:
        return 0.0

    return round(total_points / total_units, 2)


import time
