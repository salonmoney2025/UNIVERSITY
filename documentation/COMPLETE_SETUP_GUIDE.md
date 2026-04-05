# 🎓 EBKUST University Management System - Complete Setup & Walkthrough Guide

## 📋 Table of Contents
1. [What Has Been Completed](#what-has-been-completed)
2. [System Requirements](#system-requirements)
3. [Quick Start Guide](#quick-start-guide)
4. [Detailed Setup Instructions](#detailed-setup-instructions)
5. [Database Seeding](#database-seeding)
6. [Starting All Servers](#starting-all-servers)
7. [Accessing the System](#accessing-the-system)
8. [Testing the System](#testing-the-system)
9. [Troubleshooting](#troubleshooting)

---

## ✅ What Has Been Completed

### 1. **Code Cleanup & Optimization** ✓
- Removed unnecessary code and dependencies
- Optimized frontend components for better performance
- Improved responsiveness across all pages
- Fixed all compilation errors

### 2. **Complete Back Office Implementation** ✓
Created 5 fully functional Back Office modules:

#### a) **Reset Pin Password** (`/back-office/reset-pin`)
- Search by Application ID or Email
- Auto-generate or manual PIN entry
- Notification options (Email, SMS, Both)
- Reset history tracking
- Bulk reset capabilities

#### b) **Extend Pin Deadline** (`/back-office/extend-deadline`)
- Filter by Faculty, Program, Academic Year
- Extension presets (7, 14, 30, 60, 90 days) + Custom
- Bulk PIN selection
- Date validation (no past dates, max 90 days)
- Email notifications

#### c) **Transfer Applicants** (`/back-office/transfer-applicant`)
- **Cascading dropdowns**: Faculty → Department → Program
- Transfer types (Program, Faculty, Admission Cycle)
- Document transfer options
- File attachments support
- Comprehensive transfer tracking

#### d) **Online Application Management** (`/back-office/online-application`)
- Advanced filtering (Status, Payment, Documents, Date range)
- Bulk operations (Approve, Reject, Notify)
- Pagination with search
- Export to Excel
- Color-coded status badges

#### e) **Student Registration** (`/back-office/student-registration`)
- CSV/Excel file upload with validation
- Real-time preview (first 10 records)
- Validation error reporting with download
- Progress tracking with 6 steps
- Bulk import options

### 3. **Comprehensive Database Seed Script** ✓
Created `seed_comprehensive.py` command that generates:

**Administrative Staff:**
- 2 Super Admins
- 1 Campus Admin
- 6 Deans (one per faculty)
- 18 Heads of Department
- 3 HR Staff
- 4 Registry Staff
- 4 Finance Staff

**Academic Staff:**
- 50 Lecturers (configurable)
- Various designations (Professor, Associate Professor, Senior Lecturer, etc.)

**Students:**
- 200 Students (configurable)
- Matriculation numbers starting from 30000
- Realistic data with GPAs, enrollment status, guardian info

**Infrastructure:**
- 1 Main Campus (EBKUST)
- 6 Faculties (Engineering, Science, Business, Education, Medicine, Arts)
- 18 Departments
- 16 Academic Programs (Bachelor, Master, Diploma)
- 26 Courses across all departments

**Communication System:**
- Letter Templates (Admission, Offer, Transcript, Certificate)
- Digital Signatures (Registrar, VC, Dean)
- Sample Notifications for testing

### 4. **RabbitMQ & Notification System Setup** ✓
- Complete RabbitMQ documentation
- Celery task queue configuration
- Notification system (in-app, SMS, Email)
- Letter generation tasks
- Scheduled tasks (reminders, cleanup)
- Full integration guide

### 5. **Startup Scripts** ✓
- `START_ALL_SERVERS.bat` - Automated startup for all services
- `STOP_ALL_SERVERS.bat` - Clean shutdown script
- Browser auto-launch for all portals

### 6. **Comprehensive Documentation** ✓
- `RABBITMQ_NOTIFICATION_SETUP.md` - Complete notification guide
- `BACK_OFFICE_IMPLEMENTATION.md` - Detailed specifications
- `STUDENT_MANAGEMENT_IMPLEMENTATION.md` - Student module docs
- This walkthrough guide

---

## 💻 System Requirements

### Required Software:
1. **Python 3.10+** - Backend (Django)
2. **Node.js 18+** - Frontend (Next.js)
3. **PostgreSQL 15** - Database (or use SQLite for development)
4. **Redis** - Caching & Celery results
5. **RabbitMQ** - Message broker
6. **Docker Desktop** - For containerized services (optional but recommended)

### Optional:
- **Git** - Version control
- **VS Code** - IDE

---

## 🚀 Quick Start Guide (5 Minutes)

### Option 1: Using Docker (Recommended)

```bash
# 1. Start Docker Desktop (if not running)

# 2. Navigate to project
cd C:\Users\Wisdom\source\repos\UNIVERSITY

# 3. Start Docker services
docker-compose up -d postgres redis rabbitmq

# 4. Wait 10 seconds for services to initialize

# 5. Start backend
cd backend
venv\Scripts\activate
python manage.py migrate
python manage.py seed_comprehensive --students 200 --lecturers 50
python manage.py runserver

# 6. Start Celery (in new terminal)
cd backend
venv\Scripts\activate
celery -A config worker -l info --pool=solo

# 7. Frontend is already running on port 3000
```

### Option 2: Without Docker (SQLite)

```bash
# 1. Navigate to project
cd C:\Users\Wisdom\source\repos\UNIVERSITY\backend

# 2. Activate virtual environment
venv\Scripts\activate

# 3. Set environment for SQLite
set DATABASE_URL=sqlite:///db.sqlite3

# 4. Run migrations
python manage.py migrate

# 5. Seed database
python manage.py seed_comprehensive --students 200 --lecturers 50

# 6. Start backend
python manage.py runserver

# 7. Frontend is already running on port 3000
```

---

## 📝 Detailed Setup Instructions

### Step 1: Install Dependencies

#### Backend Dependencies:
```bash
cd C:\Users\Wisdom\source\repos\UNIVERSITY\backend

# Create virtual environment (if not exists)
python -m venv venv

# Activate
venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

#### Frontend Dependencies:
```bash
cd C:\Users\Wisdom\source\repos\UNIVERSITY\frontend

# Install packages (if not done)
npm install
```

### Step 2: Configure Environment

#### Backend `.env` file:
```env
# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/university_lms

# Or SQLite for development
# DATABASE_URL=sqlite:///db.sqlite3

# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=amqp://guest:guest@localhost:5672//
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# Email (Optional - for testing, use console backend)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# SMS (Optional - configure when ready)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

#### Frontend `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=EBKUST University Portal
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Database Setup

#### Option A: PostgreSQL (Recommended)

```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# Or install PostgreSQL locally from:
# https://www.postgresql.org/download/windows/

# 2. Create database
psql -U postgres
CREATE DATABASE university_lms;
\q

# 3. Run migrations
cd backend
python manage.py migrate
```

#### Option B: SQLite (Development)

```bash
# SQLite requires no setup, just set in .env:
DATABASE_URL=sqlite:///db.sqlite3

# Run migrations
python manage.py migrate
```

---

## 🌱 Database Seeding

### Seed Command:

```bash
cd C:\Users\Wisdom\source\repos\UNIVERSITY\backend
venv\Scripts\activate

# Basic seeding (200 students, 50 lecturers)
python manage.py seed_comprehensive

# Custom numbers
python manage.py seed_comprehensive --students 500 --lecturers 100

# Flush existing data first
python manage.py seed_comprehensive --flush --students 200 --lecturers 50
```

### What Gets Created:

**Administrative Staff (40+ users):**
```
✓ 2  Super Admins       (superadmin@, admin@)
✓ 1  Campus Admin       (campus.admin@)
✓ 6  Deans             (dean.foe@, dean.fos@, etc.)
✓ 18 HODs              (hod.cs@, hod.ee@, etc.)
✓ 3  HR Staff          (hr.manager@, hr.staff1@, etc.)
✓ 4  Registry Staff    (registry.admin@, registry.admission@, etc.)
✓ 4  Finance Staff     (finance.manager@, accountant@, etc.)
```

**Academic Staff:**
```
✓ 50  Lecturers         (firstname.lastname@ebkustsl.edu.sl)
      - Professors
      - Associate Professors
      - Senior Lecturers
      - Lecturers
      - Assistant Lecturers
      - Lab Technicians
```

**Students:**
```
✓ 200 Students          (firstname.lastname###@student.ebkustsl.edu.sl)
      - Matric Numbers: 30000-30199
      - Various programs and levels
      - Realistic GPAs (2.0-4.0)
      - Guardian information
```

**Infrastructure:**
```
✓ 1  Campus     (EBKUST Main Campus)
✓ 6  Faculties  (Engineering, Science, Business, Education, Medicine, Arts)
✓ 18 Departments
✓ 16 Programs   (Bachelor, Master, Diploma)
✓ 26 Courses    (CS, MATH, EE, ACC, etc.)
```

**Communication:**
```
✓ 4   Letter Templates (Admission, Offer, Transcript, Certificate)
✓ 3   Digital Signatures
✓ 1000+ Sample Notifications
```

### Default Credentials:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@ebkustsl.edu.sl | admin123 |
| System Admin | admin@ebkustsl.edu.sl | admin123 |
| Campus Admin | campus.admin@ebkustsl.edu.sl | campus123 |
| Dean | dean.foe@ebkustsl.edu.sl | dean123 |
| HOD | hod.cs@ebkustsl.edu.sl | hod123 |
| HR | hr.manager@ebkustsl.edu.sl | hr123 |
| Registry | registry.admin@ebkustsl.edu.sl | registry123 |
| Finance | finance.manager@ebkustsl.edu.sl | finance123 |
| Lecturer | [firstname].[lastname]@ebkustsl.edu.sl | lecturer123 |
| Student | [firstname].[lastname]###@student.ebkustsl.edu.sl | student123 |

---

## 🎬 Starting All Servers

### Automated Start (Windows):

```batch
# Double-click the file or run:
START_ALL_SERVERS.bat
```

This will:
1. Check Docker is running
2. Start PostgreSQL, Redis, RabbitMQ
3. Start Django backend (port 8000)
4. Start Celery worker
5. Start Celery beat scheduler
6. Open browser windows automatically

### Manual Start:

#### Terminal 1: Docker Services
```bash
cd C:\Users\Wisdom\source\repos\UNIVERSITY
docker-compose up -d postgres redis rabbitmq
```

#### Terminal 2: Django Backend
```bash
cd C:\Users\Wisdom\source\repos\UNIVERSITY\backend
venv\Scripts\activate
python manage.py runserver
```

#### Terminal 3: Celery Worker
```bash
cd C:\Users\Wisdom\source\repos\UNIVERSITY\backend
venv\Scripts\activate
celery -A config worker -l info --pool=solo
```

#### Terminal 4: Celery Beat (Optional - for scheduled tasks)
```bash
cd C:\Users\Wisdom\source\repos\UNIVERSITY\backend
venv\Scripts\activate
celery -A config beat -l info
```

#### Terminal 5: Frontend (Already Running)
```bash
# Frontend should already be running from earlier
# If not:
cd C:\Users\Wisdom\source\repos\UNIVERSITY\frontend
npm run dev
```

---

## 🌐 Accessing the System

### Main Portals:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Next.js frontend application |
| **Backend API** | http://localhost:8000 | Django REST API |
| **API Docs** | http://localhost:8000/api/docs/ | Swagger UI documentation |
| **Admin Panel** | http://localhost:8000/admin/ | Django admin interface |
| **RabbitMQ** | http://localhost:15672 | RabbitMQ management (guest/guest) |

### Key Features to Test:

#### 1. **Dashboard** (`/dashboard`)
- User-specific dashboard based on role
- Statistics and overview

#### 2. **Back Office** (`/back-office`)
- Reset Pin Password
- Extend Pin Deadline
- Transfer Applicants
- Online Application Management
- Student Registration

#### 3. **Student Management** (`/students`)
- Add Student (with 6-tab form)
- Edit Student Information
- Manage Halls
- Student Promotions
- Generate Class Lists
- Reset Passwords
- Delete Students

#### 4. **Letters** (`/letters`)
- Print Offer Letter
- Print Admission Letter
- Provisional Letter
- Acceptance Letter
- Deferral Letter

#### 5. **Applications** (`/applications`)
- Applicant Counts
- Verify Applications
- Check Results
- View All Applications
- Update Course Info
- Transfer Applicants
- Exemptions

---

## 🧪 Testing the System

### 1. Test Login:

```
URL: http://localhost:3000/login

Test Account (Super Admin):
Email: superadmin@ebkustsl.edu.sl
Password: admin123
```

### 2. Test Student Login:

```
# Get a student email from database
cd backend
python manage.py shell

from apps.students.models import Student
student = Student.objects.first()
print(f"Email: {student.user.email}")
print(f"Password: student123")
```

### 3. Test Back Office Features:

**A. Reset PIN:**
1. Navigate to `/back-office/reset-pin`
2. Search for an application (e.g., "APP2025001")
3. Select PIN type
4. Choose auto-generate or manual
5. Submit reset

**B. Transfer Applicant:**
1. Navigate to `/back-office/transfer-applicant`
2. Search for a student
3. Select new Faculty (cascading dropdown activates)
4. Select new Department (cascading dropdown activates)
5. Select new Program
6. Submit transfer

**C. Student Registration:**
1. Navigate to `/back-office/student-registration`
2. Download template
3. Fill with sample data
4. Upload CSV/Excel file
5. Validate and preview
6. Confirm import

### 4. Test Notifications:

```python
# In Django shell
python manage.py shell

from apps.communications.tasks import send_notification
from apps.students.models import Student

student = Student.objects.first()

# Send notification
send_notification.delay(
    recipient_id=str(student.user.id),
    title='Test Notification',
    message='System is working perfectly!',
    notification_type='INFO',
    priority='HIGH'
)

# Check in frontend: Login as student → Notifications
```

### 5. Test Letter Generation:

```python
# In Django shell
from apps.letters.tasks import generate_admission_letter
from apps.students.models import Student

student = Student.objects.first()

# Generate letter
result = generate_admission_letter.delay(str(student.id))

# Check result
print(result.get())
```

---

## 🔧 Troubleshooting

### Issue 1: Docker not running

**Solution:**
```bash
# Start Docker Desktop
# Then run:
docker ps

# If still not working, restart Docker Desktop
```

### Issue 2: Port already in use

**Solution:**
```bash
# Check what's using the port
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID [process_id] /F
```

### Issue 3: Database connection error

**Solution:**
```bash
# Check PostgreSQL is running
docker ps | findstr postgres

# Or check if PostgreSQL service is running
services.msc

# Restart PostgreSQL
docker-compose restart postgres
```

### Issue 4: Celery worker not starting

**Solution:**
```bash
# Use solo pool for Windows
celery -A config worker -l info --pool=solo

# If still fails, check RabbitMQ
docker ps | findstr rabbitmq
```

### Issue 5: Frontend build errors

**Solution:**
```bash
cd frontend

# Clear cache
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### Issue 6: Migration errors

**Solution:**
```bash
cd backend

# Reset migrations (CAUTION: Deletes data)
python manage.py migrate --run-syncdb

# Or flush database
python manage.py flush

# Re-run migrations
python manage.py migrate

# Re-seed
python manage.py seed_comprehensive
```

---

## 📊 System Status Checklist

Before starting work, verify:

- [ ] Docker Desktop is running
- [ ] PostgreSQL container is running (port 5432)
- [ ] Redis container is running (port 6379)
- [ ] RabbitMQ container is running (ports 5672, 15672)
- [ ] Django backend is running (port 8000)
- [ ] Celery worker is running
- [ ] Frontend is running (port 3000)
- [ ] Database is seeded
- [ ] Can login as Super Admin
- [ ] Can login as Student
- [ ] Notifications are working
- [ ] All pages load without errors

---

## 🎯 Quick Commands Reference

```bash
# Start all Docker services
docker-compose up -d

# Stop all Docker services
docker-compose down

# View logs
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f rabbitmq

# Django management
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_comprehensive
python manage.py shell

# Celery
celery -A config worker -l info --pool=solo
celery -A config beat -l info
celery -A config flower  # Monitoring UI

# Frontend
npm run dev
npm run build
npm run start

# Database
python manage.py dbshell  # SQLite
psql -U postgres -d university_lms  # PostgreSQL
```

---

## 📚 Additional Documentation

- **Backend API**: http://localhost:8000/api/docs/
- **RabbitMQ Setup**: `RABBITMQ_NOTIFICATION_SETUP.md`
- **Back Office**: `BACK_OFFICE_IMPLEMENTATION.md`
- **Student Management**: `STUDENT_MANAGEMENT_IMPLEMENTATION.md`

---

## 🎉 You're All Set!

The system is now fully configured with:
- ✅ 200 Students
- ✅ 50 Lecturers
- ✅ 40+ Administrative staff
- ✅ Complete campus infrastructure
- ✅ Notification system ready
- ✅ All features functional

**Happy Testing!** 🚀

For issues or questions, check the troubleshooting section or review the detailed documentation files.
