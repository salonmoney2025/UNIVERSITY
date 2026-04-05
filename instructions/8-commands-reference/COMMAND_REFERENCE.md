# 📚 Command Reference - EBKUST University Management System

Quick reference for all deployment commands and scripts.

---

## 🪟 **Windows Commands**

### **Testing & Setup**

```batch
# Test Docker setup
scripts\test-docker-setup.bat

# Start development environment
scripts\deploy-development.bat

# Stop all services
scripts\stop-all.bat
```

### **Docker Commands**

```batch
# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Restart service
docker-compose restart frontend

# Stop everything
docker-compose down

# Clean rebuild
docker-compose down -v && docker-compose up -d --build
```

---

## 🐧 **Linux Commands**

### **1. Testing**

```bash
# Test Docker setup (development)
./scripts/test-docker-setup.sh development

# Test Docker setup (production)
./scripts/test-docker-setup.sh production

# Verify deployment
./scripts/verify-deployment.sh production
```

### **2. Server Provisioning**

```bash
# Provision a fresh Ubuntu server (one-time setup)
sudo ./scripts/provision-server.sh

# What it does:
# - Installs Docker, Node.js, Python
# - Configures firewall (UFW)
# - Sets up Fail2ban
# - Creates swap space
# - Optimizes system parameters
# - Creates deployment user
```

### **3. Environment Configuration**

```bash
# Quick setup (auto-generate secrets only)
./scripts/configure-env.sh production
# Select option: 1

# Interactive setup (guided configuration)
./scripts/configure-env.sh production
# Select option: 2

# Manual setup (create file only)
./scripts/configure-env.sh production
# Select option: 3
```

### **4. Deployment**

#### **Production Deployment**

```bash
# Full deployment with rebuild
./scripts/deploy-production.sh --build --migrate --collect-static --backup

# Quick update (no rebuild)
./scripts/deploy-production.sh --migrate

# Deploy with backup only
./scripts/deploy-production.sh --backup

# Just rebuild images
./scripts/deploy-production.sh --build

# Collect static files
./scripts/deploy-production.sh --collect-static
```

#### **Development Deployment**

```bash
# Start development environment
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### **5. Backup & Restore**

#### **Backup**

```bash
# Manual backup (production)
./scripts/backup-database.sh production

# Manual backup (development)
./scripts/backup-database.sh development

# Setup automated daily backups (2 AM)
sudo crontab -e
# Add this line:
0 2 * * * /path/to/scripts/backup-database.sh production >> /var/log/backup.log 2>&1
```

#### **Restore**

```bash
# Restore from backup
./scripts/restore-database.sh backups/database/backup_file.sql.gz production

# List available backups
ls -lh backups/database/*.sql.gz
```

### **6. Monitoring**

#### **Logs**

```bash
# All services (production)
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f postgres

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 backend

# Since specific time
docker-compose -f docker-compose.prod.yml logs --since 1h backend
```

#### **Status & Health**

```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Resource usage (live)
docker stats

# Disk usage
docker system df

# Verify deployment
./scripts/verify-deployment.sh production
```

### **7. Scaling**

```bash
# Scale backend workers
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Scale Celery workers
docker-compose -f docker-compose.prod.yml up -d --scale celery_worker=5

# Scale Rust API
docker-compose -f docker-compose.prod.yml up -d --scale rust-api=2
```

### **8. Maintenance**

#### **Update Application**

```bash
# Pull latest code
git pull origin main

# Rebuild and deploy
./scripts/deploy-production.sh --build --migrate --backup
```

#### **Database Migrations**

```bash
# Run migrations (Django)
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Create migration
docker-compose -f docker-compose.prod.yml exec backend python manage.py makemigrations

# Check migration status
docker-compose -f docker-compose.prod.yml exec backend python manage.py showmigrations
```

#### **Django Management**

```bash
# Create superuser
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# Django shell
docker-compose -f docker-compose.prod.yml exec backend python manage.py shell
```

#### **Clean Up**

```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Clean everything (DANGEROUS!)
docker system prune -a --volumes -f
```

### **9. SSL/TLS Certificates**

#### **Let's Encrypt**

```bash
# First time setup
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos

# Copy certificates to project
sudo mkdir -p docker/nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/nginx/ssl/key.pem
sudo chown -R $USER:$USER docker/nginx/ssl

# Renew certificates (manual)
sudo certbot renew

# Auto-renewal (cron job)
sudo crontab -e
# Add:
0 0 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/yourdomain.com/*.pem /path/to/docker/nginx/ssl/ && docker-compose -f docker-compose.prod.yml restart nginx
```

#### **Self-Signed (Testing)**

```bash
mkdir -p docker/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/nginx/ssl/key.pem \
  -out docker/nginx/ssl/cert.pem \
  -subj "/C=SL/ST=Northern/L=Makeni/O=EBKUST/CN=yourdomain.com"
```

### **10. Troubleshooting**

#### **Port Issues**

```bash
# Find process using port 80
sudo lsof -i :80

# Find process using port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>

# Or stop all Docker services
docker-compose -f docker-compose.prod.yml down
```

#### **Permission Issues**

```bash
# Fix permissions
sudo chown -R $USER:$USER .

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### **Database Issues**

```bash
# Check database connection
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres

# Database shell
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d university_lms

# Reset database (DANGEROUS!)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d postgres
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

#### **Memory Issues**

```bash
# Check memory usage
free -h

# Add 4GB swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 🔗 **Service URLs**

### **Development (Local)**

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | N/A |
| Django Admin | http://localhost/admin | Create superuser |
| API v1 (Django) | http://localhost/api/v1/ | Auth token |
| API v2 (Rust) | http://localhost/api/v2/ | Auth token |
| RabbitMQ Management | http://localhost:15672 | guest/guest |

### **Production**

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | https://yourdomain.com | N/A |
| Django Admin | https://yourdomain.com/admin | Superuser |
| API v1 (Django) | https://yourdomain.com/api/v1/ | Auth token |
| API v2 (Rust) | https://yourdomain.com/api/v2/ | Auth token |

---

## 📦 **Docker Compose Commands**

### **Start/Stop**

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d frontend

# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION!)
docker-compose down -v
```

### **Build/Rebuild**

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build frontend

# Build without cache
docker-compose build --no-cache

# Pull latest images
docker-compose pull
```

### **Execute Commands**

```bash
# Execute command in running container
docker-compose exec backend python manage.py migrate

# Execute with different user
docker-compose exec -u root backend apt-get update

# Execute in new container
docker-compose run backend python manage.py shell
```

---

## 🔧 **Useful One-Liners**

```bash
# Find all Python processes
ps aux | grep python

# Kill all Python processes
pkill -9 python

# Check if port 80 is open
nc -zv localhost 80

# Monitor logs in real-time with grep
docker-compose logs -f | grep ERROR

# Get container IP address
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_name

# Cleanup old Docker images (older than 7 days)
docker image prune -a --filter "until=168h"

# Show Docker disk usage
docker system df -v

# Export database to SQL
docker-compose exec postgres pg_dump -U postgres university_lms > backup.sql

# Import database from SQL
cat backup.sql | docker-compose exec -T postgres psql -U postgres university_lms
```

---

## 📊 **Health Check Endpoints**

```bash
# Frontend health
curl -f http://localhost:3000

# Backend API health
curl -f http://localhost/api/v1/health/

# Rust API health
curl -f http://localhost/api/v2/health

# PostgreSQL health
docker-compose exec postgres pg_isready -U postgres

# Redis health
docker-compose exec redis redis-cli ping

# RabbitMQ health
docker-compose exec rabbitmq rabbitmq-diagnostics ping
```

---

## 🚀 **Quick Deployment Scenarios**

### **Scenario 1: First-Time Production Deployment**

```bash
# 1. Provision server
sudo ./scripts/provision-server.sh

# 2. Reboot
sudo reboot

# 3. Clone repository
git clone <repo-url> /opt/ebkust-university
cd /opt/ebkust-university

# 4. Configure environment
./scripts/configure-env.sh production

# 5. Setup SSL
sudo certbot certonly --standalone -d yourdomain.com
sudo cp /etc/letsencrypt/live/yourdomain.com/*.pem docker/nginx/ssl/

# 6. Test setup
./scripts/test-docker-setup.sh production

# 7. Deploy
./scripts/deploy-production.sh --build --migrate --collect-static

# 8. Create superuser
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# 9. Verify
./scripts/verify-deployment.sh production

# 10. Setup backups
sudo crontab -e
# Add: 0 2 * * * /opt/ebkust-university/scripts/backup-database.sh production
```

### **Scenario 2: Update Existing Deployment**

```bash
# 1. Backup first
./scripts/backup-database.sh production

# 2. Pull latest code
git pull origin main

# 3. Deploy updates
./scripts/deploy-production.sh --migrate

# 4. Verify
./scripts/verify-deployment.sh production
```

### **Scenario 3: Rollback After Failed Deployment**

```bash
# 1. Restore from backup
./scripts/restore-database.sh backups/database/latest_backup.sql.gz production

# 2. Revert code
git reset --hard HEAD~1

# 3. Redeploy
./scripts/deploy-production.sh
```

---

## 📞 **Quick Help**

| Problem | Command |
|---------|---------|
| Services won't start | `docker-compose down && docker-compose up -d` |
| Port already in use | `sudo lsof -i :80 && sudo kill -9 <PID>` |
| Out of memory | `sudo fallocate -l 4G /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile` |
| Database connection failed | `docker-compose restart postgres` |
| Frontend not loading | `docker-compose restart frontend nginx` |
| 502 Bad Gateway | `docker-compose restart backend nginx` |
| Need to see logs | `docker-compose logs -f` |
| Clean up disk space | `docker system prune -a -f` |

---

**Last Updated**: 2024-04-02
**Version**: 1.0.0
