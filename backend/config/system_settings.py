"""
System-wide configuration settings for University LMS
"""

# Currency Configuration
CURRENCY_SETTINGS = {
    'code': 'SLL',
    'symbol': 'Le',
    'name': 'Sierra Leone Leone',
    'decimal_places': 2,
    'locale': 'en-SL',
}

# System Information
SYSTEM_INFO = {
    'name': 'University Learning Management System',
    'short_name': 'University LMS',
    'version': '1.0.0',
    'country': 'Sierra Leone',
}

# Module Configuration
ENABLED_MODULES = [
    'student_management',
    'examination_management',
    'finance_management',
    'hr_management',
    'application_management',
    'communication_management',
    'database_management',
]

# Feature Flags
FEATURES = {
    'sms_notifications': True,
    'email_notifications': True,
    'letter_generation': True,
    'payment_gateway': True,
    'mobile_money': True,
    'bank_integration': True,
    'biometric_attendance': False,
    'online_exams': True,
    'result_auto_publish': False,
}

# Payment Gateway Configuration
PAYMENT_GATEWAYS = {
    'mobile_money': {
        'enabled': True,
        'providers': ['MTN', 'Airtel', 'Orange'],
        'currency': 'SLL',
    },
    'bank_transfer': {
        'enabled': True,
        'currency': 'SLL',
    },
    'cash': {
        'enabled': True,
        'currency': 'SLL',
    },
}

# Notification Settings
NOTIFICATION_SETTINGS = {
    'sms': {
        'provider': 'twilio',  # or 'africas_talking'
        'enabled': True,
    },
    'email': {
        'enabled': True,
    },
    'push': {
        'enabled': False,
    },
}

# Academic Settings
ACADEMIC_SETTINGS = {
    'grading_system': 'CGPA',  # or 'GPA', 'Percentage'
    'max_grade': 4.0,
    'passing_grade': 2.0,
    'attendance_percentage': 75,
}

# File Upload Settings
UPLOAD_SETTINGS = {
    'max_file_size_mb': 10,
    'allowed_document_types': ['.pdf', '.doc', '.docx', '.jpg', '.png'],
    'allowed_image_types': ['.jpg', '.jpeg', '.png', '.gif'],
}
