# EBKUST University LMS - Project Structure

**Last Updated:** March 20, 2026
**Status:** Reorganized and Optimized

---

## 📁 Root Directory Structure

```
UNIVERSITY/
├── documentation/          # All project documentation
├── frontend/              # Next.js 14 frontend application
├── backend/               # Django REST Framework backend
├── docker/                # Docker configuration files
├── scripts/               # Build and deployment scripts
├── docker-compose.yml     # Docker services configuration
├── .env                   # Environment variables
└── README.md             # Main project readme
```

---

## 📚 Documentation Folder

All project documentation is organized in the `documentation/` folder:

- **COMPLETE_SYSTEM_SUMMARY.md** - Complete system overview
- **DATABASE_SEEDING_SUMMARY.md** - Database setup guide
- **IMPLEMENTATION_ROADMAP.md** - Development roadmap
- **LOGIN_FIX_SUMMARY.md** - Authentication system docs
- **SYSTEM_HEALTH_REPORT.md** - System monitoring guide
- And 16+ other comprehensive documentation files

---

## 🎨 Frontend Structure

The frontend is built with **Next.js 14** (App Router) and organized using route groups for better code organization.

### App Directory Organization

```
frontend/app/
├── (auth)/                # Authentication Routes
│   ├── login/            # Login page → /login
│   └── register/         # Registration → /register
│
├── (dashboard)/          # Main Dashboard & User Routes
│   ├── dashboard/        # Main dashboard → /dashboard
│   ├── profile/          # User profile → /profile
│   ├── settings/         # User settings → /settings
│   └── student-portal/   # Student portal → /student-portal
│
├── (academic)/           # Academic Management
│   ├── students/         # Student management → /students
│   ├── courses/          # Course management → /courses
│   └── examinations/     # Exam management → /examinations
│
├── (financial)/          # Financial Management
│   ├── finance/          # Finance module → /finance
│   ├── banks/            # Bank management → /banks
│   ├── receipt/          # Receipt management → /receipt
│   └── application-pins/ # Application pins → /application-pins
│
├── (administrative)/     # HR & Staff Management
│   ├── hr-management/    # HR system → /hr-management
│   ├── staff/            # Staff management → /staff
│   ├── staff-id-cards/   # Staff IDs → /staff-id-cards
│   └── student-id-cards/ # Student IDs → /student-id-cards
│
├── (operations)/         # Operational Modules
│   ├── applications/     # Admissions → /applications
│   ├── letters/          # Letter management → /letters
│   ├── library/          # Library system → /library
│   ├── calendar/         # Calendar → /calendar
│   ├── notifications/    # Notifications → /notifications
│   ├── communications/   # Communications → /communications
│   └── help-desk/        # Help desk → /help-desk
│
├── (system)/            # System Administration
│   ├── system-admins/   # Admin users → /system-admins
│   ├── system-settings/ # System config → /system-settings
│   ├── database/        # Database tools → /database
│   ├── reports/         # Reporting → /reports
│   └── admin-users/     # User management → /admin-users
│
├── admin-dashboard/     # Redirects to /dashboard
├── api/                 # Next.js API routes
│   ├── auth/           # Authentication API
│   ├── users/          # User management API
│   ├── payments/       # Payment processing API
│   ├── dashboard/      # Dashboard data API
│   └── ...             # Other API endpoints
│
├── layout.tsx          # Root layout
├── page.tsx            # Home page
├── globals.css         # Global styles
└── fonts/              # Font files
```

### Route Groups Explanation

**Route groups** (folders with parentheses like `(auth)`) are used for organization only and **do not affect the URL structure**:

- `(auth)/login/page.tsx` → URL: `/login` (not `/auth/login`)
- `(dashboard)/dashboard/page.tsx` → URL: `/dashboard` (not `/dashboard/dashboard`)
- `(academic)/students/page.tsx` → URL: `/students` (not `/academic/students`)

This allows us to organize code logically without changing routes!

### Other Frontend Folders

```
frontend/
├── components/          # Reusable React components
│   ├── layout/         # Layout components (Sidebar, Header, etc.)
│   ├── notifications/  # Notification components
│   └── ui/             # UI components
├── lib/                 # Utility functions and libraries
├── hooks/               # Custom React hooks
├── stores/              # State management (Zustand)
├── contexts/            # React contexts
├── types/               # TypeScript type definitions
├── prisma/              # Prisma ORM schema and migrations
├── public/              # Static assets
└── config files         # Next.js, TypeScript, Tailwind configs
```

---

## 🔧 Backend Structure

The backend is built with **Django 4.2** and **Django REST Framework**.

```
backend/
├── apps/                # Django applications
│   ├── authentication/  # User authentication & authorization
│   ├── students/        # Student management
│   ├── staff/           # Staff management
│   ├── courses/         # Course management
│   ├── exams/           # Examination system
│   ├── finance/         # Financial management
│   ├── campuses/        # Multi-campus support
│   ├── communications/  # SMS/Email system
│   └── analytics/       # Analytics & reporting
│
├── config/              # Django project configuration
│   ├── settings/       # Settings (base, dev, prod)
│   ├── urls.py         # URL routing
│   └── wsgi.py         # WSGI config
│
├── core/                # Core utilities
│   ├── exceptions/     # Custom exceptions
│   ├── middleware/     # Custom middleware
│   └── utils/          # Utility functions
│
├── static/              # Static files
├── media/               # Uploaded media files
├── staticfiles/         # Collected static files
├── manage.py            # Django management script
└── requirements/        # Python dependencies
```

---

## 🐳 Docker Structure

```
UNIVERSITY/
├── docker-compose.yml   # Main Docker Compose file
└── docker/
    └── nginx/          # Nginx configuration (if any)
```

### Docker Services

1. **postgres** - PostgreSQL 15 database
2. **redis** - Redis 7 cache
3. **rabbitmq** - RabbitMQ message broker
4. **backend** - Django application
5. **celery_worker** - Celery task worker
6. **celery_beat** - Celery task scheduler
7. **frontend** - Next.js application

---

## 🚀 Quick Start Guide

### 1. Start All Services
```bash
docker compose up -d
```

### 2. Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Django Admin:** http://localhost:8000/admin
- **RabbitMQ Management:** http://localhost:15672

### 3. Login Credentials

**Super Admin:**
- Email: `superadmin@university.edu`
- Password: `Super@Admin123`

**Alternative Accounts:**
- Email: `superadmin1@university.edu` | Password: `12345`
- Email: `admin@university.edu` | Password: `admin123`

---

## 📋 Development Workflow

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Backend Development

```bash
cd backend
python manage.py runserver
```

### Database Migrations

```bash
docker exec university_backend python manage.py makemigrations
docker exec university_backend python manage.py migrate
```

---

## 🗂️ Feature Organization

Each major feature is organized in its own directory with:

```
feature-name/
├── page.tsx            # Main page component
├── layout.tsx          # Feature layout (if needed)
├── loading.tsx         # Loading state
├── error.tsx           # Error boundary
└── components/         # Feature-specific components (if needed)
```

---

## 📊 Module Overview

### Academic Modules
- **Students** - Student registration, records, management
- **Courses** - Course catalog, scheduling, timetables
- **Examinations** - Exam management, grading, transcripts

### Financial Modules
- **Finance** - Fee management, invoicing, revenue tracking
- **Banks** - Bank integration, payment processing
- **Receipts** - Receipt generation and verification

### Administrative Modules
- **HR Management** - Staff management, payroll, leave, performance
- **Staff** - Staff directory and records
- **ID Cards** - ID card generation (staff & students)

### Operational Modules
- **Applications** - Admissions and application processing
- **Library** - Library management system
- **Calendar** - Academic calendar and events
- **Communications** - SMS, email, notifications

### System Modules
- **System Admins** - User and admin management
- **System Settings** - Campus, faculty, department settings
- **Database** - Database tools and management
- **Reports** - System-wide reporting

---

## 🔐 Security Features

- JWT Authentication
- Role-Based Access Control (RBAC)
- Password hashing with bcrypt
- HTTPS/TLS encryption
- CSRF protection
- XSS protection
- SQL injection prevention

---

## 📈 Scalability

- Horizontal scaling support
- Redis caching layer
- Celery task queue for async operations
- Database connection pooling
- CDN-ready static file serving

---

## 🛠️ Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Query

**Backend:**
- Django 4.2
- Django REST Framework
- PostgreSQL 15
- Redis 7
- Celery + RabbitMQ
- Prisma ORM (Frontend DB)

**DevOps:**
- Docker & Docker Compose
- Nginx (Production)
- GitHub Actions (CI/CD)

---

## 📞 Support

For issues or questions:
1. Check the documentation in `documentation/` folder
2. Review relevant module documentation
3. Check system logs: `docker compose logs`

---

**Project Status:** ✅ Production Ready
**Version:** 1.0.0
**Organization:** Ernest Bai Koroma University of Science and Technology (EBKUST)
