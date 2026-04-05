# EBKUST University Management System - Docker Setup Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Initial Setup](#initial-setup)
4. [Starting the System](#starting-the-system)
5. [Stopping the System](#stopping-the-system)
6. [Accessing Services](#accessing-services)
7. [Default Credentials](#default-credentials)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
1. **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
   - Version: 20.10 or higher
   - Download: https://www.docker.com/products/docker-desktop

2. **Docker Compose**
   - Version: 2.0 or higher
   - Included with Docker Desktop
   - Linux users: Install separately

3. **Git** (for cloning the repository)
   - Download: https://git-scm.com/downloads

### System Requirements
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: Minimum 20GB free space
- **CPU**: 4 cores recommended
- **OS**: Windows 10/11, macOS 10.15+, or Linux

---

## Project Overview

### Architecture
This project uses a microservices architecture with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                         Nginx (Port 80)                      │
│                    Reverse Proxy / API Gateway               │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼───────┐    ┌───────▼────────┐   ┌───────▼──────┐
│   Frontend    │    │ Django Backend │   │  Rust API    │
│  (Next.js)    │    │   (Python)     │   │   (v2)       │
│  Port: 3000   │    │   Port: 8000   │   │  Port: 8081  │
└───────────────┘    └────────────────┘   └──────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌───────▼─────┐      ┌────────▼────────┐
│   PostgreSQL   │   │    Redis    │      │    RabbitMQ     │
│   Port: 5432   │   │  Port: 6379 │      │  Port: 5672     │
│  (Database)    │   │   (Cache)   │      │ (Message Queue) │
└────────────────┘   └─────────────┘      └─────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌────────▼────────┐
│ Celery Worker  │   │  Celery Beat    │
│ (Background)   │   │  (Scheduler)    │
└────────────────┘   └─────────────────┘
```

### Services Description

| Service | Technology | Port | Purpose |
|---------|-----------|------|---------|
| **Frontend** | Next.js 15 + React 19 + TypeScript | 3000 | User interface |
| **Backend** | Django + Django REST Framework | 8000 | API v1 (Python) |
| **Rust API** | Actix-web + SQLx | 8081 | API v2 (High performance) |
| **PostgreSQL** | PostgreSQL 15 | 5432 | Primary database |
| **Redis** | Redis 7 | 6379 | Caching & session storage |
| **RabbitMQ** | RabbitMQ 3 | 5672, 15672 | Message broker |
| **Celery Worker** | Celery | - | Background tasks |
| **Celery Beat** | Celery | - | Scheduled tasks |
| **Nginx** | Nginx Alpine | 80, 443 | Reverse proxy |

---

## Initial Setup

### Step 1: Clone the Repository

```bash
# Navigate to your projects directory
cd C:\Users\Wisdom\source\repos

# If not already cloned:
git clone <repository-url> UNIVERSITY
cd UNIVERSITY
```

### Step 2: Configure Environment Variables

Create a `.env` file in the project root:

```bash
cd C:\Users\Wisdom\source\repos\UNIVERSITY
```

Create `.env` file with the following content:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
POSTGRES_DB=university_lms
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DB_HOST=postgres
DB_PORT=5432
DB_NAME=university_lms
DB_USER=postgres
DB_PASSWORD=postgres123

# ============================================
# DJANGO BACKEND CONFIGURATION
# ============================================
DJANGO_SECRET_KEY=your-django-secret-key-change-in-production
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend,nginx
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/university_lms

# ============================================
# RUST API CONFIGURATION
# ============================================
UMS__SERVER__HOST=0.0.0.0
UMS__SERVER__PORT=8081
UMS__DATABASE__URL=postgresql://postgres:postgres123@postgres:5432/university_lms
UMS__DATABASE__MAX_CONNECTIONS=10
UMS__DATABASE__MIN_CONNECTIONS=2
UMS__DATABASE__CONNECT_TIMEOUT_SECONDS=30
UMS__JWT__SECRET=your-secret-key-change-in-production-min-32-chars
UMS__JWT__EXPIRATION_HOURS=24
UMS__RABBITMQ__URL=amqp://guest:guest@rabbitmq:5672
UMS__RABBITMQ__EXCHANGE=ums
RUST_LOG=api=debug,shared=debug,sqlx=warn

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_SECRET=your-jwt-secret-key-min-32-characters-long-change-in-production
JWT_EXPIRATION_HOURS=24

# ============================================
# REDIS CONFIGURATION
# ============================================
REDIS_URL=redis://redis:6379/0
REDIS_HOST=redis
REDIS_PORT=6379

# ============================================
# RABBITMQ CONFIGURATION
# ============================================
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
CELERY_BROKER_URL=amqp://guest:guest@rabbitmq:5672

# ============================================
# CELERY CONFIGURATION
# ============================================
CELERY_RESULT_BACKEND=redis://redis:6379/0

# ============================================
# NEXT.JS FRONTEND CONFIGURATION
# ============================================
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RUST_API_URL=http://localhost:8081
NODE_ENV=development
```

### Step 3: Verify Docker Installation

```bash
# Check Docker version
docker --version
# Expected: Docker version 20.10 or higher

# Check Docker Compose version
docker-compose --version
# Expected: Docker Compose version 2.0 or higher

# Verify Docker is running
docker ps
# Should show no errors
```

### Step 4: Build Docker Images

```bash
# Build all services (first time setup)
cd C:\Users\Wisdom\source\repos\UNIVERSITY
docker-compose build

# This will take 10-20 minutes on first run
# Downloads base images and installs dependencies
```

---

## Starting the System

### Method 1: Start All Services (Recommended)

```bash
# Navigate to project directory
cd C:\Users\Wisdom\source\repos\UNIVERSITY

# Start all services in detached mode
docker-compose up -d

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f rust-api
```

### Method 2: Start Specific Services

```bash
# Start only database services
docker-compose up -d postgres redis rabbitmq

# Start backend services
docker-compose up -d backend celery_worker celery_beat

# Start frontend
docker-compose up -d frontend

# Start Rust API
docker-compose up -d rust-api

# Start Nginx
docker-compose up -d nginx
```

### Method 3: Using PowerShell Script (Windows)

```powershell
# Navigate to project directory
cd C:\Users\Wisdom\source\repos\UNIVERSITY

# Run start script
.\START_SERVERS.ps1
```

### Verify Services Are Running

```bash
# Check all container statuses
docker-compose ps

# Expected output shows all services "Up" and "healthy"
# Wait 2-3 minutes for all health checks to pass
```

### Service Startup Order

Services start automatically in this order (managed by Docker Compose):
1. **PostgreSQL** (30 seconds)
2. **Redis** (10 seconds)
3. **RabbitMQ** (30 seconds)
4. **Backend** (waits for DB to be healthy)
5. **Rust API** (waits for DB to be healthy)
6. **Celery Services** (wait for backend + RabbitMQ)
7. **Frontend** (waits for backend)
8. **Nginx** (waits for all services)

**Total startup time**: ~2-3 minutes for first run

---

## Stopping the System

### Method 1: Stop All Services (Keep Data)

```bash
cd C:\Users\Wisdom\source\repos\UNIVERSITY

# Stop all services (preserves volumes/data)
docker-compose stop

# Or gracefully stop with 10 second timeout
docker-compose down
```

### Method 2: Stop and Remove Everything

```bash
# Stop and remove containers + networks (keeps volumes)
docker-compose down

# Stop and remove EVERYTHING including volumes (DELETES DATA)
docker-compose down -v

# WARNING: -v flag deletes all database data!
```

### Method 3: Using PowerShell Script (Windows)

```powershell
cd C:\Users\Wisdom\source\repos\UNIVERSITY
.\STOP_SERVERS.ps1
```

### Stop Specific Services

```bash
# Stop only frontend
docker-compose stop frontend

# Stop backend services
docker-compose stop backend celery_worker celery_beat

# Stop database services
docker-compose stop postgres redis rabbitmq
```

---

## Accessing Services

### Web Interfaces

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend (Main App)** | http://localhost:3000 | University Management System UI |
| **Nginx Gateway** | http://localhost | Load balancer / reverse proxy |
| **Django Backend** | http://localhost:8000 | REST API v1 |
| **Rust API** | http://localhost:8081 | REST API v2 |
| **RabbitMQ Management** | http://localhost:15672 | Message queue monitoring |

### API Endpoints

**Django Backend (Port 8000):**
```
http://localhost:8000/api/auth/login/
http://localhost:8000/api/students/
http://localhost:8000/api/campuses/
http://localhost:8000/admin/  (Django admin panel)
```

**Rust API (Port 8081):**
```
http://localhost:8081/api/v2/auth/login
http://localhost:8081/api/v2/students
http://localhost:8081/health
```

### Database Access

**PostgreSQL:**
```bash
# Connect via Docker container
docker exec -it university_postgres psql -U postgres -d university_lms

# Or via local PostgreSQL client
Host: localhost
Port: 5432
Database: university_lms
Username: postgres
Password: postgres
```

**Redis:**
```bash
# Connect via Docker container
docker exec -it university_redis redis-cli

# Basic commands
127.0.0.1:6379> KEYS *
127.0.0.1:6379> GET some_key
```

### Log Access

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f rust-api
docker-compose logs -f postgres

# View last 100 lines
docker-compose logs --tail=100 backend

# View logs since specific time
docker-compose logs --since 2024-01-01T00:00:00 backend
```

---

## Default Credentials

### Frontend Login (Main Application)

**Super Admin Account:**
- URL: http://localhost:3000
- Email: `superadmin1@university.edu`
- Password: `Admin123!`
- Role: Super Administrator (Full Access)

**Admin Account:**
- Email: `admin@university.edu`
- Password: `Admin123!`
- Role: Administrator

**Test Student Account:**
- Email: `student@university.edu`
- Password: `Student123!`
- Role: Student

### Django Admin Panel

- URL: http://localhost:8000/admin/
- Username: `admin`
- Password: `admin123`
- Purpose: Backend administration

### RabbitMQ Management Console

- URL: http://localhost:15672
- Username: `guest`
- Password: `guest`
- Purpose: Monitor message queues

### PostgreSQL Database

- Host: `localhost`
- Port: `5432`
- Database: `university_lms`
- Username: `postgres`
- Password: `postgres`
- Admin Password: `postgres123`

### Redis

- Host: `localhost`
- Port: `6379`
- Password: None (no password by default)

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:**
```
Error: Bind for 0.0.0.0:3000 failed: port is already allocated
```

**Solution:**
```bash
# Windows: Find process using port
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /F /PID <PID>

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Use port 3001 instead
```

#### 2. Container Fails to Start

**Check logs:**
```bash
docker-compose logs <service-name>
docker logs university_frontend
```

**Common fixes:**
```bash
# Remove old containers
docker-compose down

# Rebuild images
docker-compose build --no-cache <service-name>

# Start again
docker-compose up -d
```

#### 3. Database Connection Errors

**Error:**
```
could not connect to server: Connection refused
```

**Solution:**
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Wait for database to be healthy
docker-compose up -d postgres
# Wait 30 seconds

# Check logs
docker-compose logs postgres

# Restart dependent services
docker-compose restart backend rust-api
```

#### 4. Frontend Shows "ChunkLoadError"

**Solution:**
```bash
# Clear Next.js cache
docker-compose stop frontend
docker exec -it university_frontend rm -rf .next
docker-compose start frontend

# Or rebuild
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

#### 5. Slow Performance / High Memory Usage

**Check resources:**
```bash
# View container resource usage
docker stats

# If memory is maxed out:
# - Increase Docker Desktop memory allocation (Settings > Resources)
# - Restart Docker Desktop
# - Restart containers
```

#### 6. Services Show "Unhealthy" Status

**Check health:**
```bash
docker-compose ps

# View specific service health logs
docker inspect university_backend | grep -A 10 Health
```

**Solution:**
```bash
# Restart unhealthy service
docker-compose restart <service-name>

# Or rebuild if issue persists
docker-compose up -d --force-recreate <service-name>
```

### Reset Everything

**Complete reset (DELETES ALL DATA):**
```bash
# Stop all services
docker-compose down -v

# Remove all containers, networks, volumes
docker system prune -a --volumes

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### Get Help

**Check service health:**
```bash
docker-compose ps
docker-compose logs -f
```

**Inspect specific container:**
```bash
docker inspect university_frontend
docker exec -it university_frontend /bin/sh
```

---

## Advanced Operations

### Database Backup

```bash
# Backup PostgreSQL database
docker exec -t university_postgres pg_dump -U postgres university_lms > backup_$(date +%Y%m%d).sql

# Restore backup
docker exec -i university_postgres psql -U postgres university_lms < backup_20240101.sql
```

### Update Application Code

```bash
# Pull latest changes
git pull origin main

# Rebuild affected services
docker-compose build frontend backend rust-api

# Restart services
docker-compose up -d
```

### Scale Services

```bash
# Run multiple Celery workers
docker-compose up -d --scale celery_worker=3
```

### View Resource Usage

```bash
# Real-time resource monitoring
docker stats

# Container disk usage
docker system df
```

---

## Production Deployment Notes

### Security Checklist

- [ ] Change all default passwords
- [ ] Set strong JWT secrets (32+ characters)
- [ ] Set `DJANGO_DEBUG=False`
- [ ] Configure HTTPS/SSL certificates
- [ ] Use environment-specific `.env` files
- [ ] Enable firewall rules
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Enable Docker security scanning

### Environment Variables for Production

Update `.env` file:
```env
DJANGO_DEBUG=False
NODE_ENV=production
POSTGRES_PASSWORD=<strong-random-password>
JWT_SECRET=<strong-random-secret-64-chars>
DJANGO_SECRET_KEY=<strong-random-secret>
```

### Performance Optimizations

1. **Frontend**: Build production bundle
```bash
docker-compose -f docker-compose.prod.yml build frontend
```

2. **Database**: Tune PostgreSQL settings
3. **Redis**: Configure persistence
4. **Nginx**: Enable caching and compression

---

## Quick Reference Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose stop

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Restart service
docker-compose restart <service>

# Rebuild service
docker-compose build <service>

# Remove everything
docker-compose down -v

# Execute command in container
docker exec -it <container-name> <command>
```

---

**Last Updated:** 2026-03-31
**Version:** 1.0.0
**Maintainer:** EBKUST IT Team
