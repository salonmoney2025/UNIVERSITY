# 🐳 Docker Deployment Guide - EBKUST University Management System

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [SSL/TLS Setup](#ssltls-setup)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Scaling](#scaling)
- [Troubleshooting](#troubleshooting)
- [Backup & Recovery](#backup--recovery)

---

## Overview

The EBKUST University Management System uses Docker Compose for containerized deployment with the following services:

| Service | Purpose | Port |
|---------|---------|------|
| **PostgreSQL** | Primary database | 5432 (internal) |
| **Redis** | Caching & session storage | 6379 (internal) |
| **RabbitMQ** | Message broker | 5672, 15672 |
| **Django Backend** | API v1 (Python) | 8000 (internal) |
| **Rust API** | API v2 (High-performance) | 8081 (internal) |
| **Next.js Frontend** | Web interface | 3000 (internal) |
| **Nginx** | Reverse proxy & load balancer | 80, 443 |
| **Celery Worker** | Background task processor | N/A |
| **Celery Beat** | Task scheduler | N/A |

---

## Prerequisites

### System Requirements

**Minimum (Development)**:
- 4 GB RAM
- 2 CPU cores
- 20 GB disk space
- Docker 20.10+ and Docker Compose 2.0+

**Recommended (Production for 7M users)**:
- 32 GB RAM
- 8 CPU cores
- 500 GB SSD storage
- Docker 24.0+ and Docker Compose 2.20+

### Software Requirements

1. **Install Docker**:
   ```bash
   # Windows (Use Docker Desktop)
   https://www.docker.com/products/docker-desktop/

   # Linux (Ubuntu/Debian)
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER

   # Verify installation
   docker --version
   docker-compose --version
   ```

2. **Install Git** (if not already installed):
   ```bash
   # Windows
   https://git-scm.com/download/win

   # Linux
   sudo apt-get install git
   ```

---

## Quick Start (Development)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ebkust-university-ums.git
cd ebkust-university-ums
```

### 2. Set Up Environment Variables
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your development settings
nano .env  # or use your preferred editor
```

### 3. Start Development Environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Django Admin**: http://localhost/admin
- **API v1 (Django)**: http://localhost/api/v1/
- **API v2 (Rust)**: http://localhost/api/v2/
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

### 5. Create Superuser (First Time)
```bash
# Create Django superuser
docker-compose exec backend python manage.py createsuperuser

# Or run migrations
docker-compose exec backend python manage.py migrate
```

### 6. Stop Development Environment
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: Deletes data!)
docker-compose down -v
```

---

## Production Deployment

### Step 1: Server Setup

1. **Provision a server** (AWS EC2, DigitalOcean, Azure, etc.)
   - Ubuntu 22.04 LTS recommended
   - Open ports: 80, 443, 22

2. **Update system**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y git curl wget
   ```

3. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   newgrp docker
   ```

### Step 2: Clone Repository
```bash
git clone https://github.com/yourusername/ebkust-university-ums.git
cd ebkust-university-ums
```

### Step 3: Configure Production Environment

1. **Create production environment file**:
   ```bash
   cp .env.production.example .env.production
   nano .env.production
   ```

2. **Generate secure secrets**:
   ```bash
   # Django SECRET_KEY
   python3 -c "import secrets; print(secrets.token_urlsafe(50))"

   # JWT Secret
   openssl rand -base64 32

   # Database password
   openssl rand -base64 24
   ```

3. **Update critical values in `.env.production`**:
   - `SECRET_KEY` - Django secret key
   - `JWT_SECRET` - JWT authentication secret
   - `POSTGRES_PASSWORD` - Database password
   - `RABBITMQ_USER` and `RABBITMQ_PASS` - Message broker credentials
   - `ALLOWED_HOSTS` - Your domain name
   - `NEXT_PUBLIC_API_URL` - Your domain URL
   - Email settings (SMTP)
   - Payment gateway keys (Flutterwave/PayStack)

### Step 4: SSL/TLS Certificate Setup

#### Option A: Let's Encrypt (Recommended - Free)

1. **Install Certbot**:
   ```bash
   sudo apt install -y certbot
   ```

2. **Stop nginx temporarily**:
   ```bash
   docker-compose -f docker-compose.prod.yml stop nginx
   ```

3. **Generate certificate**:
   ```bash
   sudo certbot certonly --standalone \
     -d yourdomain.com \
     -d www.yourdomain.com \
     --email admin@yourdomain.com \
     --agree-tos \
     --no-eff-email
   ```

4. **Copy certificates to project**:
   ```bash
   sudo mkdir -p docker/nginx/ssl
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/nginx/ssl/cert.pem
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/nginx/ssl/key.pem
   sudo chown -R $USER:$USER docker/nginx/ssl
   ```

5. **Set up auto-renewal**:
   ```bash
   sudo crontab -e
   # Add this line:
   0 0 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/yourdomain.com/*.pem /path/to/project/docker/nginx/ssl/ && docker-compose -f /path/to/project/docker-compose.prod.yml restart nginx
   ```

#### Option B: Self-Signed Certificate (Testing Only)

```bash
mkdir -p docker/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/nginx/ssl/key.pem \
  -out docker/nginx/ssl/cert.pem \
  -subj "/C=SL/ST=Northern/L=Makeni/O=EBKUST/CN=yourdomain.com"
```

### Step 5: Update Nginx Configuration

Edit `docker/nginx/nginx.prod.conf` and replace `server_name _;` with your domain:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

### Step 6: Build and Deploy

1. **Build production images**:
   ```bash
   docker-compose -f docker-compose.prod.yml build --no-cache
   ```

2. **Start production services**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Check service health**:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml logs -f
   ```

4. **Run initial setup**:
   ```bash
   # Run migrations
   docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

   # Create superuser
   docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

   # Collect static files
   docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
   ```

5. **Verify deployment**:
   - Visit https://yourdomain.com
   - Check https://yourdomain.com/api/v1/health/
   - Check https://yourdomain.com/api/v2/health

---

## Environment Configuration

### Critical Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `SECRET_KEY` | Django secret key | `django-insecure-xyz123...` |
| `JWT_SECRET` | JWT token signing | `abcdef123456...` |
| `POSTGRES_PASSWORD` | Database password | `StrongP@ssw0rd!` |
| `ALLOWED_HOSTS` | Allowed domains | `yourdomain.com,www.yourdomain.com` |
| `DATABASE_URL` | Database connection | `postgresql://user:pass@postgres:5432/db` |

### Email Configuration

For production email sending (e.g., Gmail):

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password  # Use App Password, not regular password
```

### Payment Gateway Configuration

**Flutterwave**:
```bash
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxxx
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TESTxxxxxxxxxxxxx
```

---

## Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Check Service Health

```bash
# Service status
docker-compose -f docker-compose.prod.yml ps

# Resource usage
docker stats

# Check specific service health
curl -f http://localhost/api/v1/health/ || echo "Backend unhealthy"
curl -f http://localhost/api/v2/health || echo "Rust API unhealthy"
```

### Restart Services

```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart frontend
docker-compose -f docker-compose.prod.yml restart backend
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Run migrations (if needed)
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

---

## Scaling

### Horizontal Scaling (Multiple Instances)

Scale specific services:

```bash
# Scale backend workers
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Scale celery workers
docker-compose -f docker-compose.prod.yml up -d --scale celery_worker=5

# Scale Rust API
docker-compose -f docker-compose.prod.yml up -d --scale rust-api=2
```

### Vertical Scaling (Resource Limits)

Edit `docker-compose.prod.yml` to adjust resource limits:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 4G
        reservations:
          cpus: '2'
          memory: 1G
```

---

## Troubleshooting

### Common Issues

#### 1. **Port Already in Use**

```bash
# Find process using port 80
sudo lsof -i :80
# Kill the process
sudo kill -9 <PID>
```

#### 2. **Database Connection Failed**

```bash
# Check if PostgreSQL is running
docker-compose -f docker-compose.prod.yml ps postgres

# View PostgreSQL logs
docker-compose -f docker-compose.prod.yml logs postgres

# Restart PostgreSQL
docker-compose -f docker-compose.prod.yml restart postgres
```

#### 3. **Frontend Build Fails**

The build may show warnings about static page generation - this is expected and safe to ignore. The polyfill in `scripts/setup-global.js` handles runtime errors.

```bash
# Rebuild frontend
docker-compose -f docker-compose.prod.yml build --no-cache frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

#### 4. **502 Bad Gateway**

```bash
# Check if backend is running
docker-compose -f docker-compose.prod.yml ps backend

# Check backend logs
docker-compose -f docker-compose.prod.yml logs backend

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

#### 5. **Out of Memory**

```bash
# Check memory usage
docker stats

# Increase swap space
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Debug Mode

To enable debug mode temporarily:

```bash
# Edit .env.production
DJANGO_DEBUG=True

# Restart backend
docker-compose -f docker-compose.prod.yml restart backend

# IMPORTANT: Disable after debugging!
DJANGO_DEBUG=False
```

---

## Backup & Recovery

### Database Backup

#### Automatic Daily Backups

Create a backup script (`scripts/backup-database.sh`):

```bash
#!/bin/bash
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="university_lms_$DATE.sql"

mkdir -p $BACKUP_DIR

docker-compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U postgres university_lms > "$BACKUP_DIR/$FILENAME"

# Compress backup
gzip "$BACKUP_DIR/$FILENAME"

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $FILENAME.gz"
```

#### Set up daily cron job:

```bash
sudo crontab -e
# Add:
0 2 * * * /path/to/scripts/backup-database.sh >> /var/log/backup.log 2>&1
```

### Manual Backup

```bash
# Backup database
docker-compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U postgres university_lms > backup_$(date +%Y%m%d).sql

# Backup media files
tar -czf media_backup_$(date +%Y%m%d).tar.gz -C /var/lib/docker/volumes/university_media_volume/_data .
```

### Restore from Backup

```bash
# Restore database
cat backup_20240315.sql | docker-compose -f docker-compose.prod.yml exec -T postgres \
  psql -U postgres university_lms

# Restore media files
tar -xzf media_backup_20240315.tar.gz -C /var/lib/docker/volumes/university_media_volume/_data
```

---

## Performance Tuning

### PostgreSQL Optimization

Edit PostgreSQL settings in `docker-compose.prod.yml`:

```yaml
command: >
  postgres
  -c max_connections=200
  -c shared_buffers=256MB
  -c effective_cache_size=1GB
  -c work_mem=4MB
```

### Redis Optimization

```yaml
command: >
  redis-server
  --maxmemory 512mb
  --maxmemory-policy allkeys-lru
```

### Nginx Caching

Nginx is already configured with caching. To clear cache:

```bash
docker-compose -f docker-compose.prod.yml exec nginx rm -rf /var/cache/nginx/*
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## Security Best Practices

1. ✅ Use strong, randomly generated passwords
2. ✅ Enable HTTPS with valid SSL certificates
3. ✅ Keep `.env.production` file secure (never commit to Git)
4. ✅ Regularly update Docker images
5. ✅ Use firewall to restrict access (UFW on Ubuntu)
6. ✅ Enable rate limiting (already configured in nginx)
7. ✅ Regular security audits and updates
8. ✅ Monitor logs for suspicious activity
9. ✅ Use non-root users in containers (already configured)
10. ✅ Regular database backups

### Firewall Setup (UFW)

```bash
# Install UFW
sudo apt install ufw

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Additional Resources

- **Docker Documentation**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/
- **Django Deployment**: https://docs.djangoproject.com/en/5.0/howto/deployment/
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **PostgreSQL Performance**: https://wiki.postgresql.org/wiki/Performance_Optimization

---

## Support

For issues or questions:
- **GitHub Issues**: https://github.com/yourusername/ebkust-university-ums/issues
- **Email**: support@ebkustsl.edu.sl
- **Documentation**: See `/docs` folder

---

**Last Updated**: 2024-04-02
**Version**: 1.0.0
**Maintainer**: EBKUST IT Department
