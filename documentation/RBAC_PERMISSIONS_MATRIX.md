# Role-Based Access Control (RBAC) Permissions Matrix

## Overview
This document defines the comprehensive permissions matrix for all user roles in the University Management System.

## User Roles

### 1. SUPER ADMIN
**Full system access and control**
- ✅ All system configuration and settings
- ✅ Create/manage all user accounts including other admins
- ✅ Access all modules across all campuses
- ✅ System database management
- ✅ Audit logs and security settings
- ✅ Financial reports and analytics (all campuses)
- ✅ Override any operation
- ✅ Backup and restore operations
- ✅ API and integration management

### 2. ADMIN
**Campus-wide administrative access**
- ✅ Manage users (except Super Admin)
- ✅ Student enrollment and records
- ✅ Staff management
- ✅ Course and curriculum management
- ✅ Examination management
- ✅ Financial management (view/manage)
- ✅ Campus-specific reports
- ✅ Communications and notifications
- ✅ Library and hostel management
- ❌ System-level configurations
- ❌ Database operations
- ❌ Cross-campus super admin functions

### 3. CAMPUS ADMIN
**Single campus administrative access**
- ✅ Manage campus-specific users
- ✅ Campus student enrollment
- ✅ Campus staff records
- ✅ Campus course management
- ✅ Campus examinations
- ✅ Campus financial reports (view only)
- ✅ Campus communications
- ❌ Cross-campus operations
- ❌ System settings
- ❌ Super admin functions

### 4. DEAN
**Faculty-level academic management**
- ✅ Faculty curriculum design
- ✅ Course approval and management
- ✅ Faculty staff oversight
- ✅ Faculty examination oversight
- ✅ Faculty performance reports
- ✅ Student academic records (faculty)
- ✅ Faculty communications
- ✅ Faculty resource allocation
- ❌ Financial management
- ❌ University-wide settings
- ❌ HR/Payroll operations

### 5. LECTURER/FACULTY
**Course and student management**
- ✅ View assigned courses
- ✅ Manage course content
- ✅ Grade management (assigned courses)
- ✅ Student attendance (assigned courses)
- ✅ Course examinations
- ✅ Student performance reports
- ✅ Course communications
- ❌ Curriculum changes
- ❌ Financial access
- ❌ Other faculty courses
- ❌ Administrative functions

### 6. ACCOUNTANT/FINANCE
**Financial operations and reporting**
- ✅ Fee management and invoicing
- ✅ Payment processing and receipts
- ✅ Financial reports and analytics
- ✅ Bank reconciliation
- ✅ Payment verification
- ✅ Student financial records
- ✅ Staff payroll (if authorized)
- ✅ Financial notifications
- ❌ Academic records
- ❌ User management
- ❌ System settings
- ❌ Examination access

### 7. STUDENT
**Personal academic portal**
- ✅ View personal profile
- ✅ View courses and timetable
- ✅ View grades and transcripts
- ✅ Pay fees online
- ✅ View fee receipts
- ✅ Course registration
- ✅ Library access
- ✅ View announcements
- ✅ Submit applications
- ❌ Other students' data
- ❌ Staff information
- ❌ Financial operations
- ❌ Administrative functions

### 8. PARENT/GUARDIAN
**Student monitoring access**
- ✅ View linked student profile
- ✅ View student grades
- ✅ View student attendance
- ✅ View student fee status
- ✅ Make fee payments
- ✅ View academic calendar
- ✅ Receive notifications
- ❌ Modify student records
- ❌ Access other students
- ❌ Administrative functions

---

## Module Permissions Matrix

### 📊 Dashboard Module
| Feature | Super Admin | Admin | Campus Admin | Dean | Lecturer | Accountant | Student | Parent |
|---------|------------|-------|--------------|------|----------|------------|---------|--------|
| View Own Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| System Analytics | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Campus Analytics | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Faculty Analytics | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### 🎓 Student Management
| Feature | Super Admin | Admin | Campus Admin | Dean | Lecturer | Accountant | Student | Parent |
|---------|------------|-------|--------------|------|----------|------------|---------|--------|
| Add Students | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Students | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Students | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View All Students | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Course Students | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Own Profile | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| View Linked Student | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 👨‍🏫 Staff Management
| Feature | Super Admin | Admin | Campus Admin | Dean | Lecturer | Accountant | Student | Parent |
|---------|------------|-------|--------------|------|----------|------------|---------|--------|
| Add Staff | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Staff | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Staff | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View All Staff | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Faculty Staff | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Payroll | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

### 📚 Course Management
| Feature | Super Admin | Admin | Campus Admin | Dean | Lecturer | Accountant | Student | Parent |
|---------|------------|-------|--------------|------|----------|------------|---------|--------|
| Create Courses | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit Courses | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Courses | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign Lecturers | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Courses | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| Manage Course Content | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Register for Courses | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

### 📝 Examination Module
| Feature | Super Admin | Admin | Campus Admin | Dean | Lecturer | Accountant | Student | Parent |
|---------|------------|-------|--------------|------|----------|------------|---------|--------|
| Create Exams | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Schedule Exams | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign Invigilators | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Enter Grades | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Approve Grades | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Results | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View Course Results | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| View Own Results | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Generate Transcripts | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |

### 💰 Finance Module
| Feature | Super Admin | Admin | Campus Admin | Dean | Lecturer | Accountant | Student | Parent |
|---------|------------|-------|--------------|------|----------|------------|---------|--------|
| Create Fee Structure | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Generate Invoices | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Process Payments | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Verify Payments | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Generate Receipts | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View All Financial Records | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Campus Reports | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Make Payments | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View Own Fees | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Bank Reconciliation | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

### 📧 Notifications & Communications
| Feature | Super Admin | Admin | Campus Admin | Dean | Lecturer | Accountant | Student | Parent |
|---------|------------|-------|--------------|------|----------|------------|---------|--------|
| Send System-wide | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Send Campus-wide | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Send Faculty-wide | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Send to Course Students | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Send Individual | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| SMS Notifications | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Email Notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |

### 📄 Letters Management
| Feature | Super Admin | Admin | Campus Admin | Dean | Lecturer | Accountant | Student | Parent |
|---------|------------|-------|--------------|------|----------|------------|---------|--------|
| Create Letter Templates | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Generate Admission Letters | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Generate Offer Letters | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Generate Reference Letters | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Generate Transcripts | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| View All Letters | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Own Letters | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Sign Letters (Digital) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### 🏢 Campus Management
| Feature | Super Admin | Admin | Campus Admin | Dean | Lecturer | Accountant | Student | Parent |
|---------|------------|-------|--------------|------|----------|------------|---------|--------|
| Create Campuses | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Campus Settings | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View All Campuses | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Own Campus | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Faculties | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage Departments | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### 💼 Business Center Module
| Feature | Super Admin | Admin | Campus Admin | Dean | Lecturer | Accountant | Student | Parent |
|---------|------------|-------|--------------|------|----------|------------|---------|--------|
| Application Pins Management | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Generate Pins | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Pin Sales | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Verify Pins | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Manage Receipts | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Generate Reports | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |

### ⚙️ System Administration
| Feature | Super Admin | Admin | Campus Admin | Dean | Lecturer | Accountant | Student | Parent |
|---------|------------|-------|--------------|------|----------|------------|---------|--------|
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Database Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Backup & Restore | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage API Keys | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| System Reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Implementation Notes

### Permission Checking
All API endpoints must check permissions using the `@permission_required` decorator:

```python
from apps.authentication.permissions import RolePermission

@permission_required([RolePermission.SUPER_ADMIN, RolePermission.ADMIN])
def view(request):
    # Only Super Admin and Admin can access
    pass
```

### Frontend Permission Display
Components should use the `usePermissions` hook:

```typescript
const { hasPermission, userRole } = usePermissions();

if (hasPermission('create_student')) {
  // Show create button
}
```

### Audit Logging
All sensitive operations must be logged:
- User login/logout
- Data modifications
- Permission changes
- Financial transactions
- System configuration changes
