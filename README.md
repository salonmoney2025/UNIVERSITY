# University ERP System

A comprehensive, modern **University Enterprise Resource Planning (ERP) System** built with .NET 10, Blazor, and Clean Architecture principles.

## System Overview

This is a complete university management system covering all aspects of university operations including:

- Student Management & Academic Records
- Academic Programs, Courses & Scheduling
- HR & Staff Management
- Finance & Fee Management
- Admissions & Enrollment
- Examinations & Grading
- Library Management
- Hostel/Accommodation Management
- Transport Management
- Analytics & Reporting
- Communications & Notifications
- System Administration

## Technology Stack

### Frontend
- **Blazor Server + WebAssembly** (Hybrid rendering)
- **MudBlazor 9.1** (Modern Material Design UI)
- **SignalR** (Real-time updates)

### Backend
- **ASP.NET Core 10.0**
- **Entity Framework Core 10.0**
- **MediatR** (CQRS pattern)
- **ASP.NET Core Identity** (Authentication/Authorization)

### Database
- **PostgreSQL** (Production)
- **SQL Server** (Development)

### Architecture
- **Clean Architecture** (Domain-driven design)
- **CQRS Pattern** (Command Query Responsibility Segregation)
- **Repository Pattern**
- **Dependency Injection**

## Project Structure

```
University/
├── University.Domain/          # Core domain entities and interfaces
│   ├── Entities/
│   ├── ValueObjects/
│   └── Interfaces/
├── University.Application/     # Business logic and use cases
│   ├── Commands/
│   ├── Queries/
│   ├── DTOs/
│   └── Interfaces/
├── University.Infrastructure/  # Data access and external services
│   ├── Data/
│   ├── Repositories/
│   └── Services/
└── University.Web/            # Blazor UI (Server + WASM)
    ├── Components/
    ├── Pages/
    └── wwwroot/
```

## Core Modules

### 1. Student Management
- Student registration and profiles
- Academic records and transcripts
- Student portal and self-service
- Attendance tracking
- Parent/guardian management

### 2. Academic Management
- Program and curriculum management
- Course catalog and syllabus
- Class scheduling and timetables
- Faculty assignment
- Semester/term management

### 3. HR & Staff Management
- Employee records and profiles
- Payroll and benefits
- Attendance and leave management
- Performance evaluations
- Training and development

### 4. Finance & Accounting
- Fee structure management
- Payment processing
- Invoicing and billing
- Expense tracking
- Financial reporting
- Budget management

### 5. Admissions & Enrollment
- Online application processing
- Document management
- Applicant evaluation
- Selection and admission
- Batch enrollment

### 6. Examinations & Grading
- Exam scheduling
- Result entry and processing
- Grade calculation
- Transcript generation
- Certificate management

### 7. Library Management
- Catalog management
- Book checkout/return
- Digital resources
- Fine management

### 8. Hostel/Accommodation
- Room allocation
- Occupancy management
- Maintenance tracking
- Billing integration

### 9. Transport Management
- Route management
- Vehicle tracking
- Student transport assignment
- Fee calculation

### 10. Analytics & Reporting
- Dashboards and KPIs
- Custom report generation
- Data export
- Trend analysis

### 11. Communications
- Email notifications
- SMS alerts
- In-app messaging
- Announcements
- Forums

### 12. System Administration
- User management
- Role-based access control
- System configuration
- Audit logging
- Backup and restore

## Security Features

Built with **VibeSec** and **OWASP Top 10:2025** best practices:

- **Defense-in-depth** security architecture
- **Role-based access control** (RBAC)
- **Multi-factor authentication** support
- **Input validation** and **sanitization**
- **SQL injection** protection
- **XSS** protection
- **CSRF** protection
- **Secure password** hashing (Identity)
- **Audit logging** for all critical operations
- **Data encryption** at rest and in transit

## Scalability Features

- **Horizontal scaling** ready
- **Caching** strategies (Redis support)
- **Async/await** patterns throughout
- **Lazy loading** for related entities
- **Pagination** for large datasets
- **Background jobs** for heavy operations
- **SignalR** for real-time updates

## Getting Started

### Prerequisites
- .NET 10 SDK
- PostgreSQL or SQL Server
- Node.js (for frontend tooling)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/salonmoney2025/UNIVERSITY.git
   cd UNIVERSITY
   ```

2. **Configure database connection**
   Update `appsettings.json` in `University.Web`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=university;Username=postgres;Password=yourpassword"
     }
   }
   ```

3. **Apply migrations**
   ```bash
   cd University.Web
   dotnet ef database update
   ```

4. **Run the application**
   ```bash
   dotnet run
   ```

5. **Access the application**
   Navigate to `https://localhost:5001`

## Development

### Running tests
```bash
dotnet test
```

### Creating migrations
```bash
dotnet ef migrations add MigrationName --project University.Infrastructure --startup-project University.Web
```

### Building for production
```bash
dotnet publish -c Release
```

## Default Credentials

After first run, the system creates default admin account:
- **Username**: admin@university.edu
- **Password**: Admin@123 (Change immediately)

## Architecture Principles

### Clean Architecture
- **Domain Layer**: Contains enterprise logic and types
- **Application Layer**: Contains business logic
- **Infrastructure Layer**: Contains data access implementation
- **Presentation Layer**: Contains UI components

### CQRS Pattern
- Commands for write operations
- Queries for read operations
- Separation of concerns
- Optimized performance

### Security First
- All user input is validated
- Parameterized queries prevent SQL injection
- HTTPS enforced
- CORS configured properly
- Security headers implemented

## Contributing

This project follows clean code principles and TDD (Test-Driven Development). Please:
1. Write tests before implementation
2. Follow the existing architecture patterns
3. Ensure all tests pass
4. Document new features

## License

Copyright 2026 SalonMoney University ERP

## Support

For issues and questions, please open an issue on GitHub.

---

Built with Claude Code using skills from [awesome-claude-skills](https://github.com/BehiSecc/awesome-claude-skills)
- VibeSec for security
- TDD for development
- Systematic debugging
- Clean architecture principles
