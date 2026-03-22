# Database Seeding Summary
**Date:** March 20, 2026
**Status:** ✅ COMPLETED

---

## Overview

The database has been successfully populated with comprehensive test data including:
- Super Admins
- Campus infrastructure (campus, faculties, departments)
- Academic programs and courses
- Staff members (lecturers, professors, HODs)
- Students with matriculation numbers

---

## 1. Super Admins Created ✅

**Total: 2 Super Admins**

| Email | Password | Name | Role |
|-------|----------|------|------|
| superadmin1@university.edu | `12345` | Super Admin 1 | SUPER_ADMIN |
| superadmin2@university.edu | `12345` | Super Admin 2 | SUPER_ADMIN |

**Authentication:**
- ✅ Created in PostgreSQL (backend)
- ✅ Created in SQLite (frontend)
- Can login to both Django admin and Next.js frontend

---

## 2. Campus Infrastructure ✅

### Campus
- **Name:** Ernest Bai Koroma University of Science and Technology (EBKUST)
- **Code:** EBKUST
- **Location:** Magburaka, Tonkolili District, Sierra Leone
- **Contact:** +23276555000 | info@ebkustsl.edu.sl

### Faculties (4)
1. Faculty of Engineering (FOE)
2. Faculty of Science (FOS)
3. Faculty of Business Administration (FOBA)
4. Faculty of Education (FOED)

### Departments (10)
1. **Computer Science** (CS) - FOE
2. **Electrical Engineering** (EE) - FOE
3. **Civil Engineering** (CE) - FOE
4. **Mathematics** (MATH) - FOS
5. **Physics** (PHY) - FOS
6. **Chemistry** (CHEM) - FOS
7. **Accounting** (ACC) - FOBA
8. **Management** (MGT) - FOBA
9. **Educational Psychology** (EDPSY) - FOED
10. **Curriculum Studies** (CURR) - FOED

---

## 3. Academic Programs ✅

**Total: 7 Programs**

| Code | Program Name | Type | Department | Duration | Credits |
|------|--------------|------|------------|----------|---------|
| BCS | Bachelor of Computer Science | Bachelor | Computer Science | 4 years | 120 |
| BEE | Bachelor of Electrical Engineering | Bachelor | Electrical Engineering | 4 years | 120 |
| BCE | Bachelor of Civil Engineering | Bachelor | Civil Engineering | 4 years | 120 |
| BMATH | Bachelor of Mathematics | Bachelor | Mathematics | 4 years | 120 |
| BAC | Bachelor of Accounting | Bachelor | Accounting | 4 years | 120 |
| MCS | Master of Computer Science | Master | Computer Science | 2 years | 60 |
| DIT | Diploma in Information Technology | Diploma | Computer Science | 2 years | 60 |

---

## 4. Courses ✅

**Total: 13 Courses**

| Code | Title | Department | Credits |
|------|-------|------------|---------|
| CS101 | Introduction to Programming | Computer Science | 3 |
| CS201 | Data Structures and Algorithms | Computer Science | 4 |
| CS301 | Database Systems | Computer Science | 3 |
| CS401 | Software Engineering | Computer Science | 3 |
| MATH101 | Calculus I | Mathematics | 4 |
| MATH201 | Linear Algebra | Mathematics | 3 |
| MATH301 | Differential Equations | Mathematics | 3 |
| EE101 | Circuit Analysis | Electrical Engineering | 4 |
| EE201 | Electronics | Electrical Engineering | 3 |
| ACC101 | Financial Accounting | Accounting | 3 |
| ACC201 | Managerial Accounting | Accounting | 3 |
| GEN101 | English Composition | Computer Science | 2 |
| GEN102 | Communication Skills | Computer Science | 2 |

---

## 5. Staff Members ✅

**Total: 50 Staff**

### Designations Distribution:
- Professors
- Associate Professors
- Senior Lecturers
- Lecturers
- Assistant Lecturers
- Heads of Department (HOD)
- Lab Technicians

### Sample Staff:
| Staff ID | Name | Designation | Department |
|----------|------|-------------|------------|
| STF12000 | Derek Gonzalez | Assistant Lecturer | Physics |
| STF12001 | Dalton Sullivan | Professor | Computer Science |
| STF12002 | Brandi Alvarez | Lab Technician | Electrical Engineering |
| STF12003 | Dana Mills | Lecturer | Curriculum Studies |
| STF12004 | Samantha Holmes | Professor | Curriculum Studies |

**Staff Attributes:**
- Unique staff IDs (STF12000 - STF12049)
- Email format: firstname.lastname@ebkustsl.edu.sl
- Password: `12345` (for all staff)
- Employment types: Full-Time, Part-Time, Contract
- Salary ranges: Le 50,000 - Le 150,000
- Assigned to various departments
- Office locations assigned

---

## 6. Students ✅

**Total: 100 Students**

### Matriculation Numbers:
- **Range:** 12000 - 12099 (5-digit numbers as requested)
- **Format:** Sequential 5-digit numbers

### Sample Students:
| Matric No | Name | Program | Status | GPA | Semester |
|-----------|------|---------|--------|-----|----------|
| 12000 | Ian Garcia | Bachelor of Mathematics | DEFERRED | 2.45 | 3 |
| 12001 | Robert Edwards | Master of Computer Science | ACTIVE | 3.78 | 2 |
| 12002 | Samuel Nelson | Diploma in Information Technology | ACTIVE | 3.12 | 5 |
| 12003 | Samantha Rodriguez | Bachelor of Civil Engineering | ACTIVE | 3.89 | 4 |
| 12004 | Elizabeth Graham | Bachelor of Electrical Engineering | SUSPENDED | 2.01 | 6 |

### Student Attributes:
- Matriculation numbers: 12000-12099
- Email format: firstname.lastname123@student.ebkustsl.edu.sl
- Password: `12345` (for all students)
- Enrollment statuses: ACTIVE, SUSPENDED, DEFERRED
- Distributed across all programs
- Random semesters (1-8)
- GPA range: 2.0 - 4.0
- Complete guardian information
- Blood groups assigned
- Emergency contacts

---

## 7. Additional Data

### Course Offerings
- 10 course offerings created for current semester
- Assigned to random staff instructors
- Schedules: Monday/Wednesday 10:00-12:00
- Room assignments
- Max capacity and enrollment tracking

---

## Data Summary Statistics

| Entity | Count |
|--------|-------|
| Total Users | 155 |
| Super Admins | 4 (2 new + 2 existing) |
| Students | 100 |
| Staff | 50 |
| Campuses | 1 |
| Faculties | 4 |
| Departments | 10 |
| Programs | 7 |
| Courses | 13 |
| Course Offerings | 10 |

---

## Login Credentials

### Super Admins:
```
Email: superadmin1@university.edu
Password: 12345

Email: superadmin2@university.edu
Password: 12345
```

### All Staff & Students:
```
Password: 12345
```

---

## How to Access Data

### Backend (Django Admin):
```bash
URL: http://localhost:8000/admin
Login: superadmin1@university.edu / 12345
```

### Frontend (Next.js):
```bash
URL: http://localhost:3000/login
Login: superadmin1@university.edu / 12345
```

### Database Console:
```bash
# PostgreSQL (Backend)
docker exec -it university_postgres psql -U postgres -d university_db

# Check students
SELECT student_id, first_name, last_name FROM students_student
JOIN authentication_user ON students_student.user_id = authentication_user.id
LIMIT 10;

# Check staff
SELECT staff_id, first_name, last_name, designation FROM staff_staffmember
JOIN authentication_user ON staff_staffmember.user_id = authentication_user.id
LIMIT 10;
```

---

## Notes on Requested Items

### ✅ Completed:
1. ✅ 2 Super Admins (superadmin1, superadmin2) with password `12345`
2. ✅ 100 Students with 5-digit matriculation numbers (12000-12099)
3. ✅ 50 Staff members (various grades: Lecturer, Professor, HOD, etc.)
4. ✅ Programs and Courses
5. ✅ Students in different levels and programs
6. ✅ Application IDs generated (student matriculation numbers)

### ⚠️ Not Implemented (Models Don't Exist):
1. ❌ **100 Applicants** - No Application/Applicant model exists in the current schema
2. ❌ **50 Letters** - No Letters model exists in the current schema

**To implement Applicants and Letters:**
- Would need to create new Django models
- Define application workflow (pending, approved, rejected)
- Create letter templates and generation system
- Add corresponding APIs and frontend pages

---

## Re-running the Seed

To re-seed the database (will delete existing data):
```bash
cd "c:\Users\Wisdom\source\repos\UNIVERSITY"
docker exec university_backend python manage.py seed_database --flush
```

To add additional data without deleting:
```bash
docker exec university_backend python manage.py seed_database
```

---

## Dashboard Data Now Shows:

- ✅ Total Students: 100
- ✅ Total Staff: 50
- ✅ Total Programs: 7
- ✅ Total Courses: 13
- ✅ Various enrollment statuses
- ✅ Different academic levels
- ✅ Multiple departments and faculties

**Try logging in to see the populated data!**

---

**Status:** ✅ Database successfully populated with comprehensive test data
**Next Steps:** Login and explore the system with populated data
