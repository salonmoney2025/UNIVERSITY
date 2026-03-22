# Migration and Deployment Guide - University Management System

## Date: March 21, 2026
## Version: 2.0.0 (Enhanced EBKUST Portal Integration)

---

## 🚨 IMPORTANT: Pre-Migration Checklist

Before running any migrations, ensure:

- [ ] **Database Backup**: Create a complete database backup
- [ ] **Environment Variables**: All required environment variables are set
- [ ] **Dependencies**: All Python packages are installed
- [ ] **Redis & PostgreSQL**: Both services are running
- [ ] **No Running Servers**: Stop all Django development servers
- [ ] **Git Commit**: Commit all changes before migration

---

## 📦 What's New in This Update

### New Modules
1. **Letters Management** - Official university letter generation and management
2. **Business Center** - Application pins, receipts, and sales tracking

### Enhanced Features
1. **40 User Roles** - Expanded from 8 to 40 role types based on EBKUST portal
2. **Comprehensive RBAC** - Role-based permissions for all modules
3. **Enhanced Permissions System** - New permission classes and decorators
4. **Audit Logging** - Complete tracking for letters and business operations

---

## 🔧 Step-by-Step Migration

### Step 1: Update Dependencies

```bash
cd backend

# Activate virtual environment (if using one)
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install any missing dependencies
pip install -r requirements.txt
```

### Step 2: Verify Configuration

Check that your `.env` file includes all necessary variables:

```bash
# Database
DB_NAME=university_lms
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Email (for letter notifications)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@university.edu
```

### Step 3: Create Database Migrations

```bash
# Navigate to backend directory
cd backend

# Create migrations for authentication (updated User model)
python manage.py makemigrations authentication

# Create migrations for new apps
python manage.py makemigrations letters
python manage.py makemigrations business_center

# Review the migration files
python manage.py showmigrations
```

**Expected Output:**
```
authentication
 [X] 0001_initial
 [X] 0002_initial
 [ ] 0003_update_role_choices  # New migration

letters
 [ ] 0001_initial

business_center
 [ ] 0001_initial
```

### Step 4: Run Migrations

```bash
# Apply all migrations
python manage.py migrate

# Verify migrations were successful
python manage.py showmigrations
```

**All migrations should now show [X]**

### Step 5: Update Existing User Roles (CRITICAL)

The User model's `role` field has been expanded from `max_length=20` to `max_length=50`. Existing roles are still valid, but you may want to update some users to the new granular roles.

```bash
# Open Django shell
python manage.py shell
```

```python
from apps.authentication.models import User

# Example: Update existing ACCOUNTANT to FINANCE
User.objects.filter(role='ACCOUNTANT').update(role='FINANCE')

# Example: Create a Business Center user
business_user = User.objects.get(email='business@university.edu')
business_user.role = 'BUSINESS_CENTER'
business_user.save()

# Exit shell
exit()
```

### Step 6: Seed Sample Data (Optional)

```bash
# Run the database seeder (if you have one)
python manage.py seed_database

# Or create sample data manually
python manage.py shell
```

```python
from apps.authentication.models import User
from apps.campuses.models import Campus
from apps.letters.models import LetterTemplate
from apps.business_center.models import PinBatch
from datetime import datetime, timedelta

# Get or create a campus
campus = Campus.objects.first()

# Create sample letter template
template = LetterTemplate.objects.create(
    name='Admission Letter Template',
    letter_type='ADMISSION',
    subject='Congratulations on Your Admission to {{campus_name}}',
    body='''
    Dear {{recipient_name}},

    We are pleased to inform you that you have been admitted to {{campus_name}}
    for the {{academic_year}} academic year.

    Your student ID is: {{student_id}}

    Please report to campus on {{report_date}}.

    Congratulations!
    ''',
    requires_signature=True,
    signature_roles=['SUPER_ADMIN', 'ADMIN', 'REGISTRY_ADMIN'],
    campus=campus,
    is_active=True,
    available_variables={
        'campus_name': 'Campus name',
        'recipient_name': 'Student name',
        'academic_year': 'Academic year',
        'student_id': 'Student ID',
        'report_date': 'Reporting date'
    }
)

# Create sample pin batch
batch = PinBatch.objects.create(
    pin_type='APPLICATION',
    quantity=100,
    price_per_pin=50.00,
    valid_from=datetime.now(),
    valid_until=datetime.now() + timedelta(days=90),
    campus=campus,
    description='Application Form Pins - 2026 Batch 1'
)

print(f"Created sample data: Template ID {template.id}, Batch {batch.batch_number}")
exit()
```

### Step 7: Verify Installation

```bash
# Run Django development server
python manage.py runserver

# In another terminal, test the new endpoints
curl http://localhost:8000/api/v1/letters/templates/
curl http://localhost:8000/api/v1/business-center/pin-batches/
```

---

## 🧪 Testing the New Features

### Test Letters Management

```bash
# Using curl or Postman

# 1. Get all letter templates
GET http://localhost:8000/api/v1/letters/templates/
Authorization: Bearer YOUR_ACCESS_TOKEN

# 2. Create a letter template (Admin only)
POST http://localhost:8000/api/v1/letters/templates/
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Transcript Request Letter",
  "letter_type": "TRANSCRIPT",
  "subject": "Transcript Request Approved",
  "body": "Dear {{recipient_name}}, Your transcript request has been approved.",
  "requires_signature": true,
  "signature_roles": ["REGISTRY_ADMIN"],
  "is_active": true
}

# 3. Generate a letter
POST http://localhost:8000/api/v1/letters/generated/
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "template": "template-uuid-here",
  "recipient_name": "John Doe",
  "recipient_email": "john@example.com",
  "subject": "Your Admission Letter",
  "campus": "campus-uuid-here",
  "metadata": {
    "campus_name": "Main Campus",
    "academic_year": "2026/2027",
    "student_id": "STU2026001"
  }
}
```

### Test Business Center

```bash
# 1. Create a pin batch
POST http://localhost:8000/api/v1/business-center/pin-batches/
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "pin_type": "APPLICATION",
  "quantity": 50,
  "price_per_pin": 50.00,
  "valid_from": "2026-03-21T00:00:00Z",
  "valid_until": "2026-06-21T23:59:59Z",
  "campus": "campus-uuid-here",
  "description": "March 2026 Application Pins"
}

# 2. Verify a pin (public endpoint - no auth required)
POST http://localhost:8000/api/v1/business-center/pins/verify/
Content-Type: application/json

{
  "pin_number": "123456789012",
  "serial_number": "ABC123DEF456"
}

# 3. Use a pin
POST http://localhost:8000/api/v1/business-center/pins/use/
Content-Type: application/json

{
  "pin_number": "123456789012",
  "serial_number": "ABC123DEF456",
  "email": "applicant@example.com",
  "phone": "+23276123456"
}

# 4. Generate a receipt
POST http://localhost:8000/api/v1/business-center/receipts/
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "receipt_type": "PIN_PURCHASE",
  "payer_name": "Jane Smith",
  "payer_email": "jane@example.com",
  "description": "Purchase of 1 application pin",
  "amount": 50.00,
  "payment_method": "MOBILE_MONEY",
  "campus": "campus-uuid-here"
}
```

### Test New User Roles

```bash
# Create users with new roles
python manage.py shell
```

```python
from apps.authentication.models import User
from apps.campuses.models import Campus

campus = Campus.objects.first()

# Create a Dean
dean = User.objects.create_user(
    email='dean@university.edu',
    password='dean123',
    first_name='Dr. John',
    last_name='Smith',
    role='DEAN',
    campus=campus
)

# Create a Registry Admin
registry_admin = User.objects.create_user(
    email='registry@university.edu',
    password='registry123',
    first_name='Mary',
    last_name='Johnson',
    role='REGISTRY_ADMIN'
)

# Create a Business Center user
business = User.objects.create_user(
    email='business@university.edu',
    password='business123',
    first_name='Ahmed',
    last_name='Hassan',
    role='BUSINESS_CENTER',
    campus=campus
)

# Create a Finance Secretariat user (system-wide)
finance_sec = User.objects.create_user(
    email='finance.sec@university.edu',
    password='finance123',
    first_name='Sarah',
    last_name='Williams',
    role='FINANCE_SECRETARIAT'
)

print("Test users created successfully!")
exit()
```

---

## 🔐 Permission Testing

### Test Role-Based Access

```python
# In Django shell
from apps.authentication.models import User
from apps.authentication.permissions import *

# Get a user
user = User.objects.get(email='dean@university.edu')

# Test permissions
print(f"Is Admin User: {user.is_admin_user}")
print(f"Is Academic Staff: {user.is_academic_staff}")
print(f"Can Manage Students: {user.can_manage_students}")
print(f"Can Manage Exams: {user.can_manage_exams}")
print(f"Can View Financial Reports: {user.can_view_financial_reports}")

# Test module access
print(f"Can Access Students Module: {can_access_module(user, 'students')}")
print(f"Can Access Finance Module: {can_access_module(user, 'finance')}")
print(f"Can Access Letters Module: {can_access_module(user, 'letters')}")
print(f"Can Access Business Center: {can_access_module(user, 'business_center')}")
```

---

## 📊 Database Schema Updates

### New Tables Created

1. **letters_lettertemplate** - Letter templates
2. **letters_generatedletter** - Generated letter instances
3. **letters_lettersignature** - Digital signatures
4. **letters_letterlog** - Letter audit logs
5. **business_center_pinbatch** - Pin batches
6. **business_center_applicationpin** - Individual pins
7. **business_center_receipt** - Receipts
8. **business_center_salesreport** - Sales reports
9. **business_center_pinverification** - Pin verification logs

### Modified Tables

1. **authentication_user**
   - `role` field: max_length increased from 20 to 50
   - New role choices added (40 total roles)

---

## 🚀 Production Deployment

### Pre-Production Checklist

- [ ] All tests passing
- [ ] Database backup created
- [ ] Environment variables configured for production
- [ ] DEBUG=False in production settings
- [ ] Static files collected: `python manage.py collectstatic`
- [ ] Migrations tested on staging environment
- [ ] Load testing completed
- [ ] Security audit performed

### Production Migration Steps

```bash
# 1. Backup production database
pg_dump -U postgres university_lms > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
pip install -r requirements.txt

# 4. Collect static files
python manage.py collectstatic --noinput

# 5. Run migrations
python manage.py migrate --no-input

# 6. Restart application server
# For Gunicorn:
sudo systemctl restart gunicorn

# For Docker:
docker-compose restart backend

# For supervisor:
sudo supervisorctl restart university-lms
```

### Rollback Procedure (If Needed)

```bash
# 1. Restore database from backup
psql -U postgres university_lms < backup_YYYYMMDD_HHMMSS.sql

# 2. Revert to previous code version
git revert HEAD
git push origin main

# 3. Restart services
sudo systemctl restart gunicorn
```

---

## 📱 Frontend Updates Required

### 1. Update Role Constants

Create/Update: `frontend/lib/constants/roles.ts`

```typescript
export const USER_ROLES = {
  // Top-level Administration
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  CAMPUS_ADMIN: 'CAMPUS_ADMIN',
  CHANCELLOR: 'CHANCELLOR',

  // Academic Roles
  DEAN: 'DEAN',
  HEAD_OF_DEPARTMENT: 'HEAD_OF_DEPARTMENT',
  LECTURER: 'LECTURER',
  PART_TIME_LECTURER: 'PART_TIME_LECTURER',
  FACULTY_ADMIN: 'FACULTY_ADMIN',
  FACULTY_EXAM: 'FACULTY_EXAM',

  // Registry Roles
  REGISTRY_ADMIN: 'REGISTRY_ADMIN',
  REGISTRY: 'REGISTRY',
  REGISTRY_ADMISSION: 'REGISTRY_ADMISSION',
  REGISTRY_HR: 'REGISTRY_HR',
  REGISTRY_ACADEMIC: 'REGISTRY_ACADEMIC',

  // Finance Roles
  FINANCE: 'FINANCE',
  FINANCE_STAFF: 'FINANCE_STAFF',
  FINANCE_SECRETARIAT: 'FINANCE_SECRETARIAT',
  FINANCE_SECRETARIAT_STAFF: 'FINANCE_SECRETARIAT_STAFF',
  ACCOUNTANT: 'ACCOUNTANT',

  // Student Services
  STUDENT_SECTION: 'STUDENT_SECTION',
  STUDENT_SECTION_STAFF: 'STUDENT_SECTION_STAFF',
  STUDENT_WARDEN: 'STUDENT_WARDEN',

  // Business & Operations
  BUSINESS_CENTER: 'BUSINESS_CENTER',
  CAMPUS_BUSINESS_CENTER: 'CAMPUS_BUSINESS_CENTER',

  // Support Services
  LIBRARY: 'LIBRARY',
  ID_CARD_PRINTING: 'ID_CARD_PRINTING',
  HELP_DESK: 'HELP_DESK',
  HUMAN_RESOURCES: 'HUMAN_RESOURCES',

  // Specialized Programs
  ELEARNING_ADMIN: 'ELEARNING_ADMIN',
  SPS_ADMIN: 'SPS_ADMIN',
  SPS_STAFF: 'SPS_STAFF',
  EXTRAMURAL_STUDIES: 'EXTRAMURAL_STUDIES',

  // Examination
  EXAMS: 'EXAMS',

  // End Users
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
} as const;

export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  CAMPUS_ADMIN: 'Campus Admin',
  CHANCELLOR: 'Chancellor',
  DEAN: 'Dean',
  HEAD_OF_DEPARTMENT: 'Head of Department',
  LECTURER: 'Lecturer',
  PART_TIME_LECTURER: 'Part-Time Lecturer',
  FACULTY_ADMIN: 'Faculty Admin',
  FACULTY_EXAM: 'Faculty Exam',
  REGISTRY_ADMIN: 'Registry Admin',
  REGISTRY: 'Registry',
  REGISTRY_ADMISSION: 'Registry Admission',
  REGISTRY_HR: 'Registry HR',
  REGISTRY_ACADEMIC: 'Registry Academic',
  FINANCE: 'Finance',
  FINANCE_STAFF: 'Finance Staff',
  FINANCE_SECRETARIAT: 'Finance Secretariat',
  FINANCE_SECRETARIAT_STAFF: 'Finance Secretariat Staff',
  ACCOUNTANT: 'Accountant',
  STUDENT_SECTION: 'Student Section',
  STUDENT_SECTION_STAFF: 'Student Section Staff',
  STUDENT_WARDEN: 'Student Warden',
  BUSINESS_CENTER: 'Business Center',
  CAMPUS_BUSINESS_CENTER: 'Campus Business Center',
  LIBRARY: 'Library',
  ID_CARD_PRINTING: 'ID Card Printing',
  HELP_DESK: 'Help Desk',
  HUMAN_RESOURCES: 'Human Resources',
  ELEARNING_ADMIN: 'eLearning Admin',
  SPS_ADMIN: 'SPS Admin',
  SPS_STAFF: 'SPS Staff',
  EXTRAMURAL_STUDIES: 'Extramural Studies',
  EXAMS: 'Exams',
  STUDENT: 'Student',
  PARENT: 'Parent',
};
```

### 2. Create Permission Utility

Create: `frontend/lib/utils/permissions.ts`

```typescript
import { USER_ROLES } from '@/lib/constants/roles';

export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

export function canManageStudents(userRole: string): boolean {
  return hasPermission(userRole, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.REGISTRY_ADMIN,
    USER_ROLES.REGISTRY,
    USER_ROLES.REGISTRY_ADMISSION,
    USER_ROLES.REGISTRY_ACADEMIC,
    USER_ROLES.STUDENT_SECTION,
    USER_ROLES.DEAN,
    USER_ROLES.HEAD_OF_DEPARTMENT,
  ]);
}

export function canManageFinance(userRole: string): boolean {
  return hasPermission(userRole, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.FINANCE,
    USER_ROLES.FINANCE_STAFF,
    USER_ROLES.FINANCE_SECRETARIAT,
    USER_ROLES.ACCOUNTANT,
    USER_ROLES.BUSINESS_CENTER,
    USER_ROLES.CAMPUS_BUSINESS_CENTER,
  ]);
}

export function canAccessModule(userRole: string, module: string): boolean {
  const modulePermissions: Record<string, string[]> = {
    letters: [
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.REGISTRY_ADMIN,
      USER_ROLES.REGISTRY,
      USER_ROLES.DEAN,
    ],
    business_center: [
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_CENTER,
      USER_ROLES.CAMPUS_BUSINESS_CENTER,
      USER_ROLES.FINANCE,
    ],
    finance: [
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.FINANCE,
      USER_ROLES.FINANCE_STAFF,
      USER_ROLES.FINANCE_SECRETARIAT,
      USER_ROLES.ACCOUNTANT,
    ],
  };

  const allowedRoles = modulePermissions[module] || [];
  return hasPermission(userRole, allowedRoles);
}
```

### 3. Create New Frontend Pages (Placeholders)

```bash
cd frontend

# Letters Management
mkdir -p app/\(system\)/letters
mkdir -p app/\(system\)/letters/templates
mkdir -p app/\(system\)/letters/generate
mkdir -p app/\(system\)/letters/pending
mkdir -p app/\(system\)/letters/issued

# Business Center
mkdir -p app/\(financial\)/business-center
mkdir -p app/\(financial\)/business-center/pins
mkdir -p app/\(financial\)/business-center/receipts
mkdir -p app/\(financial\)/business-center/reports
```

---

## 🐛 Troubleshooting

### Issue: Migration fails with "relation already exists"

**Solution:**
```bash
# Reset migrations (CAUTION: Development only!)
python manage.py migrate letters zero
python manage.py migrate business_center zero
rm apps/letters/migrations/0*.py
rm apps/business_center/migrations/0*.py
python manage.py makemigrations
python manage.py migrate
```

### Issue: "max_length too small" error for User.role

**Solution:**
This is fixed in the migration. If you encounter this, ensure you've run:
```bash
python manage.py migrate authentication
```

### Issue: ImportError for new apps

**Solution:**
Verify apps are added to INSTALLED_APPS in `backend/config/settings/base.py`

### Issue: URL not found for new endpoints

**Solution:**
Verify URL patterns are added to `backend/config/urls.py`

---

## 📞 Support and Resources

- **Documentation**: `/UNIVERSITY/documentation/`
- **RBAC Matrix**: `/UNIVERSITY/documentation/COMPREHENSIVE_RBAC_MATRIX.md`
- **Implementation Summary**: `/UNIVERSITY/IMPLEMENTATION_SUMMARY.md`
- **GitHub Issues**: Create an issue for bug reports

---

## ✅ Post-Migration Verification

Run this checklist after migration:

```bash
# 1. Check all migrations applied
python manage.py showmigrations

# 2. Check for model issues
python manage.py check

# 3. Run tests
python manage.py test

# 4. Verify new endpoints
python manage.py show_urls | grep -E "(letters|business-center)"

# 5. Create a test superuser with new system
python manage.py createsuperuser

# 6. Access Django Admin
# Go to http://localhost:8000/admin
# Verify you can see "Letters" and "Business Center" sections
```

---

**Migration Guide Version:** 2.0.0
**Last Updated:** March 21, 2026
**Compatibility:** Django 5.0+, Python 3.11+, PostgreSQL 15+
