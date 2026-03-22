# EBKUST University Learning Management System

## Ernest Bai Koroma University of Science and Technology - LMS

A comprehensive Learning Management System built with Next.js 14, TypeScript, Prisma, and SQLite for managing university operations including student management, payment processing, helpdesk support, and system administration.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Authentication & Authorization](#authentication--authorization)
- [API Routes](#api-routes)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Email Notifications](#email-notifications)
- [Deployment](#deployment)
- [Security](#security)

---

## Features

### Authentication System
- JWT-based authentication with httpOnly cookies
- Role-based access control (ADMIN, FINANCE, STAFF, STUDENT)
- Protected routes with middleware
- Login and registration pages with validation
- Password hashing with bcrypt

### Payment Management
- Generate payment receipts with auto-generated receipt numbers
- Track all payments with filtering and search
- Payment verification system
- Bank management (add, edit, view banks)
- PDF receipt generation
- Email notifications for payments

### Admin Dashboard
- Real-time analytics and statistics
- Revenue trends and payment volume charts (last 6 months)
- Payment type distribution (pie charts)
- Recent payments table
- Bank and ticket statistics
- Student count tracking

### Helpdesk System
- Submit and manage support tickets
- Ticket responses and status tracking
- Email notifications for ticket updates
- Priority and category management

### System Settings
- Campus management
- Faculty and department organization
- Course management with rollover functionality
- Digital signature management
- SMS template configuration

### Email Notifications
- Payment receipt emails
- Ticket response notifications
- Welcome emails for new users
- Customizable email templates

---

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **PDF Generation**: jsPDF
- **Notifications**: React Hot Toast

### Backend
- **API**: Next.js API Routes
- **Database ORM**: Prisma 7.5.0
- **Database**: SQLite (development) - easily migrate to PostgreSQL for production
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Email**: Nodemailer

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd c:/Users/Wisdom/source/repos/UNIVERSITY/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory with the following:
   ```env
   DATABASE_URL="file:./dev.db"

   # JWT Secret
   JWT_SECRET="your-secret-key-change-in-production"

   # SMTP Configuration (optional for development)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER=""
   SMTP_PASS=""
   FROM_EMAIL="noreply@ebkust.edu.sl"
   FROM_NAME="EBKUST University"

   # Application URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

After setting up, you can create test accounts using the registration page.

---

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── logout/
│   │   │   └── me/
│   │   ├── banks/                # Bank management
│   │   ├── payments/             # Payment processing
│   │   ├── tickets/              # Helpdesk tickets
│   │   └── dashboard/            # Analytics
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── dashboard/                # Admin dashboard
│   ├── banks/                    # Bank management pages
│   ├── receipt/                  # Payment receipt pages
│   ├── helpdesk/                 # Support ticket pages
│   ├── system-settings/          # System configuration
│   └── layout.tsx                # Root layout
├── contexts/                     # React contexts
│   └── auth-context.tsx          # Authentication context
├── lib/                          # Utilities
│   ├── auth.ts                   # JWT & password utilities
│   ├── api-middleware.ts         # API auth middleware
│   ├── email.ts                  # Email sending utilities
│   ├── pdf-generator.ts          # PDF generation
│   └── prisma.ts                 # Prisma client
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   └── dev.db                    # SQLite database file
├── middleware.ts                 # Route protection middleware
├── .env                          # Environment variables
└── package.json                  # Dependencies
```

---

## Authentication & Authorization

### How It Works

1. **User Registration**
   - User submits registration form with email, password, name, role
   - Password is hashed using bcrypt (10 salt rounds)
   - User record created in database
   - JWT token generated and set as httpOnly cookie
   - User redirected to role-appropriate dashboard

2. **User Login**
   - User submits credentials
   - Password verified using bcrypt.compare()
   - JWT token generated with user data (userId, email, role, name)
   - Token stored in httpOnly cookie (expires in 7 days)
   - Last login timestamp updated

3. **Protected Routes**
   - Middleware checks for auth-token cookie
   - Token verified using JWT secret
   - User role checked against route permissions
   - Unauthorized users redirected to login

### Role-Based Access Control

| Route | Admin | Finance | Staff | Student |
|-------|-------|---------|-------|---------|
| /dashboard | ✅ | ✅ | ❌ | ❌ |
| /receipt/generate | ✅ | ✅ | ✅ | ❌ |
| /receipt/verify | ✅ | ✅ | ❌ | ❌ |
| /banks | ✅ | ✅ | ❌ | ❌ |
| /system-settings | ✅ | ❌ | ❌ | ❌ |
| /student/dashboard | ❌ | ❌ | ❌ | ✅ |

---

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Banks
- `GET /api/banks` - Get all banks (with search/filter)
- `POST /api/banks` - Create new bank (ADMIN, FINANCE)
- `PUT /api/banks/[id]` - Update bank (ADMIN, FINANCE)
- `DELETE /api/banks/[id]` - Delete bank (ADMIN)

### Payments
- `GET /api/payments` - Get all payments (filtered by role)
- `POST /api/payments` - Create payment (ADMIN, FINANCE, STAFF)
- `POST /api/payments/verify` - Verify payment (ADMIN, FINANCE)

### Dashboard
- `GET /api/dashboard/stats` - Get analytics (ADMIN, FINANCE)

### Tickets
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/[id]` - Update ticket status

---

## Database Schema

### User Model
```prisma
model User {
  id               String    @id @default(cuid())
  email            String    @unique
  password         String
  name             String
  role             String    @default("STUDENT")
  status           String    @default("active")
  studentId        String?   @unique
  staffId          String?   @unique
  department       String?
  lastLogin        DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

### Payment Model
```prisma
model Payment {
  id              String   @id @default(cuid())
  receiptNo       String   @unique
  studentId       String
  studentName     String
  paymentType     String
  amount          Float
  paymentMethod   String
  paymentDate     DateTime
  transactionRef  String?
  academicYear    String
  semester        String
  description     String?
  status          String   @default("completed")
  verifiedBy      String?
  verifiedDate    DateTime?
  bankId          String?
  bank            Bank?    @relation(fields: [bankId], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

---

## Environment Variables

### Required Variables

```env
DATABASE_URL="file:./dev.db"         # Database connection string
JWT_SECRET="your-secret-key"          # JWT signing secret (min 32 chars)
```

### Optional Variables (Email)

```env
SMTP_HOST="smtp.gmail.com"            # SMTP server host
SMTP_PORT="587"                       # SMTP port
SMTP_USER="your-email@gmail.com"      # SMTP username
SMTP_PASS="your-app-password"         # SMTP password
FROM_EMAIL="noreply@ebkust.edu.sl"    # Sender email address
FROM_NAME="EBKUST University"         # Sender name
```

---

## Email Notifications

### Setup

1. **Gmail SMTP (Recommended for Testing)**
   - Enable 2FA on your Google account
   - Generate an App Password
   - Use the app password in `SMTP_PASS`

2. **Other SMTP Providers**
   - SendGrid, Mailgun, Amazon SES are supported

### Email Templates

Three pre-built email templates are available in `lib/email.ts`:

1. Payment Receipt Email
2. Ticket Response Email
3. Welcome Email

---

## Deployment

### Deploying to Vercel

1. **Push code to GitHub**
2. **Deploy on Vercel**
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Database Migration**

   For production, migrate to PostgreSQL:

   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```

   Update `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

---

## Security

### Best Practices Implemented

1. **Password Security**
   - bcrypt hashing with 10 salt rounds
   - Minimum 8 character password requirement

2. **JWT Security**
   - httpOnly cookies (not accessible via JavaScript)
   - Secure flag in production
   - 7-day expiration

3. **API Security**
   - All routes protected with authentication middleware
   - Role-based access control on sensitive endpoints
   - Input validation on all endpoints

---

## Features Roadmap

### Completed ✅
- JWT authentication system
- Role-based access control
- User registration and login
- Payment management with PDF receipts
- Bank management
- Admin dashboard with analytics
- Helpdesk ticketing system
- Email notification infrastructure
- Protected routes middleware
- System settings

### Upcoming Features
- Student enrollment and course registration
- Grade management
- Attendance tracking
- Document upload and management
- Mobile responsiveness improvements
- Dark mode
- Multi-language support

---

## Support

For issues or questions, create an issue in the repository or contact the development team.

---

## Credits

**Developed for Ernest Bai Koroma University of Science and Technology**

Built with Next.js, TypeScript, Prisma, and modern web technologies.

---

**Last Updated**: March 2026
**Version**: 1.0.0
