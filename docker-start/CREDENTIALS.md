# EBKUST UMS - All Credentials Reference

## Main Application (Frontend)

### URL: http://localhost:3000

#### Super Administrator Account
```
Email: superadmin1@university.edu
Password: Admin123!
Role: Super Administrator
Permissions: Full system access
```

#### Administrator Account
```
Email: admin@university.edu
Password: Admin123!
Role: Administrator
Permissions: Administrative access
```

#### Test Student Account
```
Email: student@university.edu
Password: Student123!
Role: Student
Permissions: Student portal access
```

---

## Django Backend

### Admin Panel: http://localhost:8000/admin/

```
Username: admin
Password: admin123
Access: Django admin interface
```

### API Authentication

**Endpoint:** `POST http://localhost:8000/api/auth/login/`

**Super Admin API Login:**
```json
{
  "email": "superadmin1@university.edu",
  "password": "Admin123!"
}
```

**Admin API Login:**
```json
{
  "email": "admin@university.edu",
  "password": "Admin123!"
}
```

---

## Rust API (v2)

### URL: http://localhost:8081

**Endpoint:** `POST http://localhost:8081/api/v2/auth/login`

**Login Request:**
```json
{
  "email": "superadmin1@university.edu",
  "password": "Admin123!"
}
```

**Health Check:**
```
GET http://localhost:8081/health
```

---

## PostgreSQL Database

### Connection Details

```
Host: localhost
Port: 5432
Database: university_lms
Username: postgres
Password: postgres
```

### Admin Connection

```
Host: localhost
Port: 5432
Database: university_lms
Username: postgres
Password: postgres123
```

### Connection String (Django)
```
postgresql://postgres:postgres@postgres:5432/university_lms
```

### Connection String (Rust)
```
postgresql://postgres:postgres123@postgres:5432/university_lms
```

### Access via Docker
```bash
docker exec -it university_postgres psql -U postgres -d university_lms
```

### SQL Queries
```sql
-- List all tables
\dt

-- List all users
SELECT * FROM users;

-- List all students
SELECT * FROM students;

-- Check database size
SELECT pg_size_pretty(pg_database_size('university_lms'));
```

---

## Redis Cache

### Connection Details

```
Host: localhost
Port: 6379
Password: (none)
Database: 0
```

### Connection String
```
redis://redis:6379/0
```

### Access via Docker
```bash
docker exec -it university_redis redis-cli
```

### Redis Commands
```bash
# List all keys
127.0.0.1:6379> KEYS *

# Get value
127.0.0.1:6379> GET some_key

# Set value
127.0.0.1:6379> SET test_key "test_value"

# Check memory usage
127.0.0.1:6379> INFO memory

# Flush all data (CAREFUL!)
127.0.0.1:6379> FLUSHALL
```

---

## RabbitMQ Message Broker

### Management Console: http://localhost:15672

```
Username: guest
Password: guest
Access: RabbitMQ Management UI
```

### AMQP Connection

```
Host: localhost
Port: 5672
Username: guest
Password: guest
Virtual Host: /
```

### Connection String
```
amqp://guest:guest@rabbitmq:5672
```

### Management API
```
URL: http://localhost:15672/api/
Username: guest
Password: guest
```

---

## Environment Variables (.env file)

### Database Credentials
```env
POSTGRES_DB=university_lms
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DB_USER=postgres
DB_PASSWORD=postgres123
```

### JWT Secrets
```env
JWT_SECRET=your-jwt-secret-key-min-32-characters-long-change-in-production
UMS__JWT__SECRET=your-secret-key-change-in-production-min-32-chars
DJANGO_SECRET_KEY=your-django-secret-key-change-in-production
```

### RabbitMQ Credentials
```env
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
```

### API URLs
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RUST_API_URL=http://localhost:8081
```

---

## Docker Container Access

### Access Container Shell

```bash
# Frontend
docker exec -it university_frontend sh

# Backend
docker exec -it university_backend sh

# Rust API
docker exec -it university_rust_api sh

# PostgreSQL
docker exec -it university_postgres sh

# Redis
docker exec -it university_redis sh

# RabbitMQ
docker exec -it university_rabbitmq sh
```

---

## API Testing with cURL

### Frontend Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin1@university.edu",
    "password": "Admin123!"
  }'
```

### Backend Login (Django)
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin1@university.edu",
    "password": "Admin123!"
  }'
```

### Rust API Login
```bash
curl -X POST http://localhost:8081/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin1@university.edu",
    "password": "Admin123!"
  }'
```

### Rust API Health Check
```bash
curl http://localhost:8081/health
```

---

## Security Notes

### Production Deployment

**CRITICAL: Change these before production:**

1. **All Passwords**
   - PostgreSQL: `postgres` → strong random password
   - Django admin: `admin123` → strong password
   - Application users: Change all default passwords

2. **JWT Secrets**
   - Generate cryptographically secure random strings (64+ characters)
   - Use different secrets for each environment

3. **RabbitMQ**
   - Change `guest/guest` to strong credentials
   - Disable guest user in production

4. **Environment Variables**
   - Use environment-specific `.env` files
   - Never commit `.env` to version control
   - Use secrets management (e.g., Docker secrets, Vault)

### Generate Strong Secrets

```bash
# Generate random 64-character secret
openssl rand -hex 32

# Or use Python
python -c "import secrets; print(secrets.token_hex(32))"

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Password Reset

### Reset Super Admin Password

```bash
# Access Django backend container
docker exec -it university_backend sh

# Run Django shell
python manage.py shell

# Execute password reset
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.get(email='superadmin1@university.edu')
user.set_password('NewPassword123!')
user.save()
exit()
```

### Reset Database (Complete Reset)

```bash
# WARNING: This deletes ALL data!
docker-compose down -v
docker-compose up -d
# Run migrations and create superuser again
```

---

## Backup Credentials

### Export Database with Credentials

```bash
# Backup with credentials
docker exec -t university_postgres pg_dump \
  -U postgres \
  -d university_lms \
  --clean \
  --if-exists \
  > backup_with_data_$(date +%Y%m%d).sql
```

### Restore Database

```bash
docker exec -i university_postgres psql \
  -U postgres \
  -d university_lms \
  < backup_with_data_20240101.sql
```

---

**IMPORTANT SECURITY REMINDER:**

🔒 **Never commit this file or .env to version control**
🔒 **Change all default credentials in production**
🔒 **Use strong, unique passwords for each service**
🔒 **Enable 2FA for admin accounts in production**
🔒 **Regularly rotate passwords and secrets**

---

**Last Updated:** 2026-03-31
**Version:** 1.0.0
**Classification:** CONFIDENTIAL
