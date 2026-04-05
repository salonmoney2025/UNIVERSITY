# Docker Commands Reference

## 🚀 Quick Start

### Start All Services
```batch
# Windows (Batch)
START_DOCKER.bat

# Windows (PowerShell)
.\START_DOCKER.ps1
```

### Stop All Services
```batch
STOP_DOCKER.bat

# Or manually:
docker-compose down
```

---

## 📦 Container Management

### View Running Containers
```bash
docker-compose ps
```

### View All Containers (including stopped)
```bash
docker ps -a
```

### Start Specific Service
```bash
docker-compose up -d backend
docker-compose up -d frontend
docker-compose up -d rust-api
```

### Stop Specific Service
```bash
docker-compose stop backend
docker-compose stop frontend
```

### Restart Specific Service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Remove All Containers
```bash
docker-compose down
```

### Remove Containers AND Volumes (⚠️ Deletes all data!)
```bash
docker-compose down -v
```

---

## 📊 Logs and Monitoring

### View All Logs (Live)
```bash
docker-compose logs -f
```

### View Specific Service Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f rust-api
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f rabbitmq
docker-compose logs -f celery_worker
docker-compose logs -f nginx
```

### View Last 100 Lines
```bash
docker-compose logs --tail=100 backend
```

### View Logs Since Timestamp
```bash
docker-compose logs --since 2024-03-15T10:00:00 backend
```

---

## 🔧 Execute Commands in Containers

### Django Backend Commands
```bash
# Run Django management commands
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec backend python manage.py collectstatic
docker-compose exec backend python manage.py shell

# Run database migrations
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# Seed database
docker-compose exec backend python manage.py seed_comprehensive --students 200 --lecturers 50
```

### Database Commands
```bash
# PostgreSQL shell
docker-compose exec postgres psql -U postgres university_lms

# Backup database
docker-compose exec postgres pg_dump -U postgres university_lms > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U postgres university_lms
```

### Frontend Commands
```bash
# Access frontend container shell
docker-compose exec frontend sh

# Install npm package
docker-compose exec frontend npm install package-name

# Run npm commands
docker-compose exec frontend npm run build
```

### Redis Commands
```bash
# Redis CLI
docker-compose exec redis redis-cli

# Flush all cache
docker-compose exec redis redis-cli FLUSHALL
```

### RabbitMQ Commands
```bash
# List queues
docker-compose exec rabbitmq rabbitmqctl list_queues

# List connections
docker-compose exec rabbitmq rabbitmqctl list_connections
```

---

## 🏗️ Build and Rebuild

### Rebuild All Services
```bash
docker-compose build
```

### Rebuild Specific Service
```bash
docker-compose build backend
docker-compose build frontend
docker-compose build rust-api
```

### Rebuild and Restart
```bash
docker-compose up -d --build
```

### Force Rebuild (No Cache)
```bash
docker-compose build --no-cache
```

---

## 🧹 Cleanup

### Remove Stopped Containers
```bash
docker container prune
```

### Remove Unused Images
```bash
docker image prune
```

### Remove All Unused Data
```bash
docker system prune

# Include volumes (⚠️ Deletes all data!)
docker system prune -a --volumes
```

### View Docker Disk Usage
```bash
docker system df
```

---

## 🔍 Debugging

### Check Container Health
```bash
docker-compose ps
docker inspect university_backend | grep -A 10 "Health"
```

### View Container Resource Usage
```bash
docker stats
```

### Access Container Shell
```bash
# Backend (Django)
docker-compose exec backend bash

# Frontend (Next.js)
docker-compose exec frontend sh

# Postgres
docker-compose exec postgres bash
```

### View Environment Variables
```bash
docker-compose exec backend env
```

### Test Network Connectivity
```bash
# From backend to database
docker-compose exec backend ping postgres

# From backend to redis
docker-compose exec backend ping redis

# From backend to rabbitmq
docker-compose exec backend ping rabbitmq
```

---

## 🌐 Networking

### View Networks
```bash
docker network ls
```

### Inspect Network
```bash
docker network inspect university_network
```

### View Container IPs
```bash
docker-compose exec backend hostname -i
docker-compose exec postgres hostname -i
```

---

## 📦 Volumes

### List Volumes
```bash
docker volume ls
```

### Inspect Volume
```bash
docker volume inspect university_postgres_data
docker volume inspect university_redis_data
```

### Backup Volume
```bash
# Backup postgres data
docker run --rm -v university_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

---

## 🚨 Emergency Commands

### Stop Everything Immediately
```bash
docker stop $(docker ps -aq)
```

### Remove Everything (⚠️ Nuclear option!)
```bash
docker-compose down -v
docker system prune -a --volumes
```

### Reset Docker Desktop
1. Right-click Docker Desktop tray icon
2. Select "Troubleshoot"
3. Click "Clean / Purge data"
4. Click "Reset to factory defaults"

---

## 📝 Common Tasks

### Update a Service
```bash
# 1. Stop the service
docker-compose stop backend

# 2. Rebuild
docker-compose build backend

# 3. Start again
docker-compose up -d backend
```

### View Logs for Errors
```bash
docker-compose logs backend | grep -i error
docker-compose logs frontend | grep -i error
```

### Check if Service is Responding
```bash
# Test backend health
curl http://localhost:8000/health/

# Test frontend
curl http://localhost:3000

# Test Rust API
curl http://localhost:8081/health
```

---

## 🔗 Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Django Backend | http://localhost:8000 | - |
| API Documentation | http://localhost:8000/api/docs/ | - |
| Django Admin | http://localhost:8000/admin/ | superadmin@ebkustsl.edu.sl / admin123 |
| Rust API | http://localhost:8081 | - |
| RabbitMQ Management | http://localhost:15672 | guest / guest |
| Nginx | http://localhost:80 | - |
| PostgreSQL | localhost:5432 | postgres / postgres123 |
| Redis | localhost:6379 | - |

---

## 🎯 Development Workflow

### Daily Startup
```bash
# 1. Start services
START_DOCKER.bat

# 2. Wait for services to be healthy (~30 seconds)

# 3. Run migrations (if needed)
docker-compose exec backend python manage.py migrate

# 4. Start developing!
```

### Daily Shutdown
```bash
docker-compose down
```

### After Code Changes

#### Backend Changes
```bash
docker-compose restart backend
```

#### Frontend Changes
- Hot reload automatic (no restart needed)

#### Rust Changes
```bash
docker-compose build rust-api
docker-compose up -d rust-api
```

#### Dependency Changes
```bash
# Backend (requirements.txt)
docker-compose build backend
docker-compose up -d backend

# Frontend (package.json)
docker-compose build frontend
docker-compose up -d frontend
```

---

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Find what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or stop all Docker containers
docker-compose down
```

### "Cannot connect to Docker daemon"
1. Start Docker Desktop
2. Wait 30-60 seconds
3. Try again

### "Container keeps restarting"
```bash
# Check logs
docker-compose logs backend

# Check health
docker-compose ps
```

### "Database connection refused"
```bash
# Check postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### "Out of disk space"
```bash
# Clean up
docker system prune -a

# Check disk usage
docker system df
```

---

## 📚 Additional Resources

- Docker Compose Documentation: https://docs.docker.com/compose/
- Project Documentation: See `README.md`
- Docker Deployment Guide: See `DOCKER_DEPLOYMENT_GUIDE.md`
