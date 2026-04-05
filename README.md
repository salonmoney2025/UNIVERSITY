# EBKUST University Learning Management System

**Ernest Bai Koroma University of Science and Technology**

## 🎓 Enterprise-Grade University Management System

A comprehensive, production-ready university management system built with modern technologies.

---

## 📊 Project Status

- **Version:** 2.0 Complete
- **Status:** ✅ Production Ready
- **Implementation:** 11/12 Major Systems (92%)
- **Last Updated:** April 5, 2026

---

## 🚀 Tech Stack

### Backend
- **Django 5.0** - Python web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Primary database
- **Redis** - Caching and sessions
- **Celery** - Background task processing

### Frontend
- **Next.js 15** - React framework (App Router)
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library

### Infrastructure
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **RabbitMQ** - Message broker (optional)

---

## 📁 Project Structure

```
EBKUST-LMS/
├── backend/              # Django REST API
├── frontend/             # Next.js application
├── docker/               # Docker configurations
├── scripts/              # Utility scripts
├── instructions/         # 📚 Organized documentation (START HERE!)
├── documentation/        # Additional docs
├── docs/                 # Technical documentation
├── config/               # Configuration files
└── docker-compose.yml    # Docker orchestration
```

---

## 🎯 Core Features (11 Systems Implemented)

1. ✅ **RBAC System** - 57 permissions, 10 roles
2. ✅ **Approval Workflows** - 8 pre-configured workflows
3. ✅ **Real-Time Notifications** - Email, SMS, In-app
4. ✅ **Session Management** - Multi-device tracking
5. ✅ **Bulk Operations** - CSV/Excel import/export
6. ✅ **Two-Factor Authentication** - TOTP with backup codes
7. ✅ **Advanced Analytics** - Comprehensive dashboard
8. ✅ **Document Management** - Version control & signatures
9. ✅ **Internal Messaging** - Real-time chat system
10. ✅ **Complete Audit Trail** - Full activity logging
11. ✅ **Modern Frontend** - Responsive, professional UI

---

## 🚦 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis (optional, for caching)

### Option 1: Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# Access the application
Frontend: http://localhost:3000
Backend API: http://localhost:5000
```

### Option 2: Local Development
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev  # Runs on port 3000
```

---

## 📚 Documentation

### Start Here:
→ **[Instructions Folder](instructions/README.md)** - Complete organized documentation

### Quick Links:
- **[Quick Start Guide](instructions/1-getting-started/QUICK_START.md)**
- **[Server Startup Scripts](instructions/2-server-startup/)**
- **[Docker Setup](instructions/3-docker-setup/DOCKER_QUICK_START.md)**
- **[Features Documentation](instructions/5-features-documentation/FEATURES_IMPLEMENTED.md)**
- **[Login Credentials](instructions/11-credentials-login/LOGIN_DETAILS.md)**

---

## 🔐 Default Credentials

**Super Admin:**
- Email: `superadmin2@university.edu`
- Password: `admin123`

**Note:** Change these credentials in production!

---

## 📦 System Requirements

### Minimum
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB
- Database: PostgreSQL 13+

### Recommended (Production)
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 50GB+ SSD
- Database: PostgreSQL 15+
- Redis: 6+

---

## 🌐 Deployment

### Production Deployment
See: [Deployment Guide](instructions/4-deployment-guides/COMPLETE_DEPLOYMENT_PACKAGE.md)

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📊 Statistics

| Metric | Count |
|--------|-------|
| **API Endpoints** | 100+ |
| **Database Models** | 30+ |
| **Frontend Pages** | 20+ |
| **React Components** | 50+ |
| **Lines of Code** | 50,000+ |
| **Permissions** | 57 |
| **User Roles** | 10 |
| **Workflows** | 8 |

---

## 🛠️ Development

### Run Tests
```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm test
```

### Code Style
- Backend: PEP 8, Black formatter
- Frontend: ESLint, Prettier

---

## 📈 Scalability

Designed to handle:
- **7 million+ users**
- High concurrent requests
- Distributed deployment
- Horizontal scaling ready

See: [Scalability Guide](documentation/SCALABILITY_GUIDE.md)

---

## 🤝 Contributing

This is a private university system. For internal development:
1. Create feature branch
2. Make changes
3. Submit pull request
4. Wait for review

---

## 📄 License

Proprietary - © 2026 EBKUST (Ernest Bai Koroma University of Science and Technology)

---

## 📞 Support

For technical support or questions:
- Documentation: [instructions/](instructions/)
- System Admin: Contact IT Department

---

## 🎯 Next Steps

1. **First Time?** → Start with [Quick Start Guide](instructions/1-getting-started/QUICK_START.md)
2. **Need to deploy?** → See [Docker Setup](instructions/3-docker-setup/DOCKER_QUICK_START.md)
3. **Want to develop?** → Check [Development Guides](instructions/9-development-guides/)
4. **Production deployment?** → Read [Deployment Package](instructions/4-deployment-guides/COMPLETE_DEPLOYMENT_PACKAGE.md)

---

**Built with ❤️ for EBKUST by the Development Team**

**Status:** 🚀 Production Ready
