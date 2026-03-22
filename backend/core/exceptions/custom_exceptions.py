"""
Custom exception classes for University LMS.
"""
from rest_framework.exceptions import APIException
from rest_framework import status


class StudentNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Student not found.'
    default_code = 'student_not_found'


class StaffNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Staff member not found.'
    default_code = 'staff_not_found'


class CourseNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Course not found.'
    default_code = 'course_not_found'


class InsufficientPermissionsException(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'You do not have permission to perform this action.'
    default_code = 'insufficient_permissions'


class PaymentFailedException(APIException):
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    default_detail = 'Payment processing failed.'
    default_code = 'payment_failed'


class EnrollmentException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Enrollment operation failed.'
    default_code = 'enrollment_failed'


class InvalidCredentialsException(APIException):
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Invalid credentials provided.'
    default_code = 'invalid_credentials'


class DuplicateEntryException(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'A record with this information already exists.'
    default_code = 'duplicate_entry'


class InvalidDateRangeException(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid date range provided.'
    default_code = 'invalid_date_range'


class ExamNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Exam not found.'
    default_code = 'exam_not_found'


class CampusNotFoundException(APIException):
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Campus not found.'
    default_code = 'campus_not_found'
