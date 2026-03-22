# Quick Start Guide - University Management System v2.0

## 🚀 Get Started in 5 Minutes

### Step 1: Run Migrations (2 minutes)

```bash
cd backend

# Create migrations
python manage.py makemigrations authentication
python manage.py makemigrations letters
python manage.py makemigrations business_center

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### Step 2: Start Development Server (1 minute)

```bash
# Backend (terminal 1)
cd backend
python manage.py runserver

# Frontend (terminal 2)
cd frontend
npm run dev
```

### Step 3: Test New Endpoints (2 minutes)

```bash
# Get JWT token
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email", "password": "your-password"}'

# Test letters endpoint
curl http://localhost:8000/api/v1/letters/templates/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Test business center endpoint
curl http://localhost:8000/api/v1/business-center/pin-batches/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📋 New Endpoints Cheat Sheet

### Letters Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/letters/templates/` | List templates | Required |
| POST | `/api/v1/letters/templates/` | Create template | Admin |
| GET | `/api/v1/letters/generated/` | List letters | Required |
| POST | `/api/v1/letters/generated/` | Generate letter | Admin/Registry |
| POST | `/api/v1/letters/generated/{id}/sign/` | Sign letter | Authorized |
| POST | `/api/v1/letters/generated/{id}/issue/` | Issue letter | Admin |

### Business Center

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/business-center/pin-batches/` | List batches | Required |
| POST | `/api/v1/business-center/pin-batches/` | Create batch | Business/Admin |
| GET | `/api/v1/business-center/pins/` | List pins | Required |
| POST | `/api/v1/business-center/pins/verify/` | Verify pin | **Public** |
| POST | `/api/v1/business-center/pins/use/` | Use pin | **Public** |
| GET | `/api/v1/business-center/receipts/` | List receipts | Finance |
| POST | `/api/v1/business-center/receipts/` | Create receipt | Finance |

---

## 👥 40 User Roles Quick Reference

### Top Administration (4)
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Campus-wide admin
- `CAMPUS_ADMIN` - Single campus
- `CHANCELLOR` - Strategic oversight

### Academic (6)
- `DEAN` - Faculty head
- `HEAD_OF_DEPARTMENT` - Department head
- `LECTURER` - Full-time lecturer
- `PART_TIME_LECTURER` - Part-time lecturer
- `FACULTY_ADMIN` - Faculty admin support
- `FACULTY_EXAM` - Faculty exam coordinator

### Registry (5)
- `REGISTRY_ADMIN` - Registry head
- `REGISTRY` - General registry
- `REGISTRY_ADMISSION` - Admissions specialist
- `REGISTRY_HR` - HR records
- `REGISTRY_ACADEMIC` - Academic records

### Finance (5)
- `FINANCE` - Finance head
- `FINANCE_STAFF` - Finance operations
- `FINANCE_SECRETARIAT` - System-wide finance
- `FINANCE_SECRETARIAT_STAFF` - Secretariat support
- `ACCOUNTANT` - Accounting operations

### Student Services (3)
- `STUDENT_SECTION` - Student affairs head
- `STUDENT_SECTION_STAFF` - Student support
- `STUDENT_WARDEN` - Hostel management

### Business (2)
- `BUSINESS_CENTER` - System-wide business
- `CAMPUS_BUSINESS_CENTER` - Campus business

### Support (4)
- `LIBRARY` - Library management
- `ID_CARD_PRINTING` - ID card services
- `HELP_DESK` - IT support
- `HUMAN_RESOURCES` - HR management

### Specialized (4)
- `ELEARNING_ADMIN` - eLearning platform
- `SPS_ADMIN` - Professional studies head
- `SPS_STAFF` - Professional studies support
- `EXTRAMURAL_STUDIES` - Distance learning

### Examination (1)
- `EXAMS` - University exams office

### End Users (2)
- `STUDENT` - Student portal
- `PARENT` - Parent/guardian access

---

## 🔑 Common Permission Checks

### Python (Backend)

```python
from apps.authentication.models import User
from apps.authentication.permissions import *

user = User.objects.get(email='user@university.edu')

# Check roles
user.is_admin_user  # True/False
user.is_finance_user  # True/False
user.can_manage_students  # True/False

# Check module access
can_access_module(user, 'letters')  # True/False
can_access_module(user, 'business_center')  # True/False

# Check specific permissions
has_role(user, ['SUPER_ADMIN', 'ADMIN'])  # True/False
```

### TypeScript (Frontend)

```typescript
import { canManageFinance, canAccessModule } from '@/lib/types/roles';

// Check permissions
if (canManageFinance(user)) {
  // Show finance operations
}

if (canAccessModule(user, 'letters')) {
  // Show letters module
}

// Get user's default dashboard
const dashboardRoute = getDefaultDashboardRoute(user);
router.push(dashboardRoute);
```

---

## 🧪 Quick Test Script

```python
# Python shell: python manage.py shell

from apps.authentication.models import User
from apps.campuses.models import Campus
from apps.letters.models import LetterTemplate
from apps.business_center.models import PinBatch
from datetime import datetime, timedelta

# Get campus
campus = Campus.objects.first()

# Create test users
dean = User.objects.create_user(
    email='dean@test.edu',
    password='test123',
    first_name='John',
    last_name='Smith',
    role='DEAN',
    campus=campus
)

business = User.objects.create_user(
    email='business@test.edu',
    password='test123',
    first_name='Jane',
    last_name='Doe',
    role='BUSINESS_CENTER',
    campus=campus
)

# Create letter template
template = LetterTemplate.objects.create(
    name='Test Template',
    letter_type='ADMISSION',
    subject='Test Subject',
    body='Test Body',
    campus=campus,
    is_active=True
)

# Create pin batch
batch = PinBatch.objects.create(
    pin_type='APPLICATION',
    quantity=10,
    price_per_pin=50.00,
    valid_from=datetime.now(),
    valid_until=datetime.now() + timedelta(days=90),
    campus=campus,
    created_by=business
)

print(f"✅ Created: Template ID {template.id}, Batch {batch.batch_number}")
```

---

## 📁 Key Files Reference

### Backend

| File | Purpose |
|------|---------|
| `apps/letters/models.py` | Letter data models |
| `apps/letters/views.py` | Letter API endpoints |
| `apps/business_center/models.py` | Business Center models |
| `apps/business_center/views.py` | Business Center APIs |
| `apps/authentication/models.py` | User model (40 roles) |
| `apps/authentication/permissions.py` | Permission classes |
| `config/settings/base.py` | Django settings |
| `config/urls.py` | URL routing |

### Frontend

| File | Purpose |
|------|---------|
| `lib/types/roles.ts` | TypeScript role definitions |
| `lib/utils/permissions.ts` | Permission utilities |
| `app/(system)/letters/` | Letters UI pages |
| `app/(financial)/business-center/` | Business Center UI |

### Documentation

| File | Purpose |
|------|---------|
| `FINAL_IMPLEMENTATION_REPORT.md` | Complete project overview |
| `MIGRATION_AND_DEPLOYMENT_GUIDE.md` | Deployment instructions |
| `COMPREHENSIVE_RBAC_MATRIX.md` | Detailed permissions |
| `QUICK_START_GUIDE.md` | This file |

---

## 🐛 Quick Troubleshooting

### Issue: Migrations fail

```bash
# Check migration status
python manage.py showmigrations

# If needed, fake initial migrations
python manage.py migrate letters --fake-initial
python manage.py migrate business_center --fake-initial
```

### Issue: 403 Forbidden on API

- Check JWT token is valid
- Verify user has correct role
- Check permission class on view

### Issue: Role field too small

```bash
# The migration will handle this automatically
python manage.py migrate authentication
```

---

## 📞 Quick Help

| Issue | Solution |
|-------|----------|
| Can't login | Check email/password, verify user is_active=True |
| 403 on endpoint | Check user role has permission |
| Migration error | See troubleshooting section in full guide |
| Pin not working | Check expiry date and status |
| Letter not generating | Verify template exists and is active |

---

## 🎯 Next Steps

1. **Test the system:**
   ```bash
   python manage.py test
   ```

2. **Create sample data:**
   ```bash
   python manage.py seed_database
   ```

3. **Build frontend:**
   - Create pages in `app/(system)/letters/`
   - Create pages in `app/(financial)/business-center/`
   - Add role-based routing

4. **Deploy to production:**
   - Follow `MIGRATION_AND_DEPLOYMENT_GUIDE.md`
   - Set DEBUG=False
   - Configure production database
   - Set up SSL/HTTPS

---

**For detailed information, see:**
- Full deployment: `MIGRATION_AND_DEPLOYMENT_GUIDE.md`
- Complete overview: `FINAL_IMPLEMENTATION_REPORT.md`
- Permissions details: `COMPREHENSIVE_RBAC_MATRIX.md`

**Version:** 2.0.0 | **Date:** March 21, 2026
