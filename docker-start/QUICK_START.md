# EBKUST UMS - Quick Start Guide

## 5-Minute Setup

### 1. Prerequisites Check
```bash
# Verify Docker is installed and running
docker --version
docker-compose --version
docker ps
```

### 2. Start All Services
```bash
# Navigate to project
cd C:\Users\Wisdom\source\repos\UNIVERSITY

# Start everything
docker-compose up -d

# Wait 2-3 minutes for all services to start
```

### 3. Check Status
```bash
# View all services
docker-compose ps

# All services should show "Up" status
```

### 4. Access Application
- Open browser: http://localhost:3000
- Login with:
  - Email: `superadmin1@university.edu`
  - Password: `Admin123!`

---

## One-Command Start

```bash
cd C:\Users\Wisdom\source\repos\UNIVERSITY && docker-compose up -d && docker-compose logs -f
```

---

## Stop Services

```bash
cd C:\Users\Wisdom\source\repos\UNIVERSITY && docker-compose stop
```

---

## Restart Single Service

```bash
# Restart frontend only
docker-compose restart frontend

# Restart backend only
docker-compose restart backend

# Restart database
docker-compose restart postgres
```

---

## Common Commands

| Action | Command |
|--------|---------|
| Start all | `docker-compose up -d` |
| Stop all | `docker-compose stop` |
| View logs | `docker-compose logs -f` |
| Check status | `docker-compose ps` |
| Restart service | `docker-compose restart <service>` |
| Remove all | `docker-compose down -v` |

---

## Service URLs

| Service | URL |
|---------|-----|
| Main App | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Rust API | http://localhost:8081 |
| RabbitMQ UI | http://localhost:15672 |
| Nginx Gateway | http://localhost |

---

## Default Credentials

**Main App Login:**
- Email: `superadmin1@university.edu`
- Password: `Admin123!`

**RabbitMQ:**
- Username: `guest`
- Password: `guest`

**PostgreSQL:**
- Username: `postgres`
- Password: `postgres`
- Database: `university_lms`

---

## Troubleshooting Quick Fixes

### Frontend not loading?
```bash
docker-compose restart frontend
docker-compose logs -f frontend
```

### Database connection error?
```bash
docker-compose restart postgres
# Wait 30 seconds
docker-compose restart backend rust-api
```

### Port already in use?
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### Reset everything?
```bash
docker-compose down -v
docker-compose up -d
```

---

For detailed documentation, see: `DOCKER_SETUP_GUIDE.md`
