# Docker Start Documentation

This folder contains comprehensive documentation for running the EBKUST University Management System using Docker.

## 📚 Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| **QUICK_START.md** | 5-minute quick start guide | First time setup, quick reference |
| **DOCKER_SETUP_GUIDE.md** | Complete Docker setup documentation | Detailed setup, troubleshooting, production |
| **CREDENTIALS.md** | All login credentials and passwords | Need login info, API testing, database access |

## 🚀 Quick Commands

### Start Everything
```bash
cd C:\Users\Wisdom\source\repos\UNIVERSITY
docker-compose up -d
```

### Stop Everything
```bash
docker-compose stop
```

### View Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs -f
```

## 🌐 Access URLs

- **Main Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Rust API**: http://localhost:8081
- **RabbitMQ UI**: http://localhost:15672

## 🔐 Default Login

**Email**: superadmin1@university.edu
**Password**: Admin123!

## 📖 Read First

1. **New to the project?** → Read `QUICK_START.md`
2. **Need detailed setup?** → Read `DOCKER_SETUP_GUIDE.md`
3. **Need login credentials?** → Read `CREDENTIALS.md`

## 🆘 Quick Troubleshooting

**Frontend not loading?**
```bash
docker-compose restart frontend
```

**Database errors?**
```bash
docker-compose restart postgres
docker-compose restart backend
```

**Port conflicts?**
```bash
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

**Reset everything?**
```bash
docker-compose down -v
docker-compose up -d
```

## ℹ️ More Help

For detailed troubleshooting and advanced operations, see **DOCKER_SETUP_GUIDE.md**.

---

**Last Updated**: 2026-03-31
**Project**: EBKUST University Management System
