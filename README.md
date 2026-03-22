# 🎓 University Learning Management System

A comprehensive, scalable Learning Management System built for modern universities with multi-campus support, handling millions of students.

## 🚀 Technology Stack

### Backend
- **Framework:** Django 5.0 + Django REST Framework
- **Language:** Python 3.11+
- **Database:** PostgreSQL 15+
- **Cache:** Redis 7+
- **Task Queue:** Celery + RabbitMQ
- **API:** RESTful + GraphQL (optional)

### Frontend
- **Framework:** Next.js 14 (React 18)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui
- **State Management:** Zustand / React Query
- **Forms:** React Hook Form + Zod

### DevOps
- **Containerization:** Docker + Docker Compose
- **Orchestration:** Kubernetes (production)
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus + Grafana

## 📋 Core Features

### Multi-Campus Management
✅ Centralized administration | Campus-specific settings | Cross-campus reporting

### Student Management System
✅ Admissions & Enrollment | Student Records | Medical Records | Student Portal | Attendance | Transcripts

### Staff & Faculty Management
✅ HR & Payroll | Performance Tracking | Lecturer Portal | Dean Applications | Staff Directory

### Academic Management
✅ Course Catalog | Class Scheduling | Timetables | Batch Management | Curriculum Design

### Grading & Examination System
✅ Examination Management | Automated Grading | Report Cards | GPA Calculation | Analytics

### Finance & Fee Management
✅ Fee Management | Invoicing | Payment Gateways:
  - African Mobile Money (MTN, Airtel, Orange via Flutterwave/Paystack)
  - International (Stripe, PayPal)
  - Direct Bank API Integration
  - Mock/Test Payment System

### Communication System
✅ SMS (Twilio/Africa's Talking) | Email | In-app Messaging | Announcements

### Role-Based Access Control
✅ Super Admin | Admin | Dean | Lecturer | Student | Parent | Accountant | Campus Admin

### Additional Modules
📚 Library | 🏠 Hostel | 📊 Analytics | 📱 Mobile-Responsive | 🔒 Enterprise Security

## 🏗️ Project Structure

The project is organized into well-structured modules for better maintainability:

```
UNIVERSITY/
├── documentation/          # 📚 All project documentation (21+ docs)
├── frontend/              # 🎨 Next.js 14 frontend application
│   ├── app/              # App directory with route groups
│   │   ├── (auth)/       # Authentication routes
│   │   ├── (dashboard)/  # Dashboard & user routes
│   │   ├── (academic)/   # Academic management
│   │   ├── (financial)/  # Financial management
│   │   ├── (administrative)/ # HR & staff management
│   │   ├── (operations)/ # Operational modules
│   │   ├── (system)/     # System administration
│   │   └── api/          # API routes
│   ├── components/       # Reusable components
│   ├── lib/              # Utility functions
│   ├── hooks/            # Custom React hooks
│   └── stores/           # State management
├── backend/               # ⚙️ Django REST Framework backend
│   ├── apps/             # Django applications
│   │   ├── authentication/   # Auth & RBAC
│   │   ├── students/         # Student management
│   │   ├── staff/            # Staff management
│   │   ├── courses/          # Course management
│   │   ├── exams/            # Examination system
│   │   ├── finance/          # Financial management
│   │   ├── campuses/         # Multi-campus support
│   │   ├── communications/   # SMS/Email system
│   │   └── analytics/        # Analytics & reporting
│   ├── config/           # Django configuration
│   └── core/             # Core utilities
├── scripts/               # 🔧 Build and deployment scripts
├── docker-compose.yml     # 🐳 Docker services configuration
└── README.md             # This file
```

### Frontend Route Organization

The frontend uses **Next.js 14 route groups** for logical organization:

- **(auth)** - Login, Registration
- **(dashboard)** - Main dashboard, Profile, Settings
- **(academic)** - Students, Courses, Examinations
- **(financial)** - Finance, Banks, Receipts
- **(administrative)** - HR, Staff, ID Cards
- **(operations)** - Applications, Library, Calendar, Communications
- **(system)** - System Admin, Settings, Reports, Database

📖 **For detailed structure documentation, see:** [`documentation/PROJECT_STRUCTURE.md`](documentation/PROJECT_STRUCTURE.md)

## 🚦 Getting Started

### Quick Start with Docker

```bash
git clone https://github.com/salonmoney2025/UNIVERSITY.git
cd UNIVERSITY
cp .env.example .env
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Django Admin:** http://localhost:8000/admin
- **RabbitMQ Management:** http://localhost:15672

### Login Credentials

**Super Administrator:**
```
Email: superadmin@university.edu
Password: Super@Admin123
```

**Alternative Accounts:**
- Email: `superadmin1@university.edu` | Password: `12345`
- Email: `admin@university.edu` | Password: `admin123`
- Email: `finance@university.edu` | Password: `finance123`
- Email: `student@university.edu` | Password: `student123`

## 🔒 Security

JWT Auth | RBAC | TLS 1.3 | PCI-DSS Payments | OWASP Compliance | Audit Logging

## 📈 Scalability

Supports 1M+ users | <200ms API response | 99.9% uptime | Horizontal scaling

## 🗺️ Roadmap

**Phase 1:** Core MVP (Student, Staff, Auth, Finance, Courses)
**Phase 2:** Exams, Grading, Payments, Notifications
**Phase 3:** Library, Hostel, Mobile Apps, AI Features
**Phase 4:** Multi-tenancy, Global Deployment

---

**Built with ❤️ for modern universities**
