# University LMS - Docker Testing Guide

## Current Status: Building Docker Containers

Docker Compose is currently building and pulling images for all 8 services:

### Services Being Built:
1. **postgres** - PostgreSQL 15-alpine database
2. **redis** - Redis 7-alpine cache
3. **rabbitmq** - RabbitMQ 3-management-alpine message broker
4. **backend** - Django REST API (building from Dockerfile)
5. **celery_worker** - Celery worker for async tasks
6. **celery_beat** - Celery beat scheduler
7. **frontend** - Next.js 14 application (building from Dockerfile)
8. **nginx** - Reverse proxy (production profile only)

## Build Process

Current command running:
```bash
docker compose up --build -d
```

This will:
- Pull all required base images
- Build custom Docker images for backend and frontend
- Create Docker networks and volumes
- Start all containers in detached mode
- Set up health checks

## Expected Build Time

- **Image pulling**: 5-10 minutes (depending on internet speed)
- **Backend build**: 3-5 minutes (installing Python dependencies)
- **Frontend build**: 2-3 minutes (installing Node dependencies)
- **Total**: ~10-15 minutes for first build

## Once Build Completes

### 1. Check Container Status
```bash
docker ps
```

You should see 7 running containers:
- university_postgres
- university_redis
- university_rabbitmq
- university_backend
- university_celery_worker
- university_celery_beat
- university_frontend

### 2. Access Services

**Frontend Application**:
- URL: http://localhost:3000
- Login page should load
- Test login with: admin@university.edu / admin123

**Backend API**:
- URL: http://localhost:8000/api/v1/
- Swagger docs: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/
- Admin panel: http://localhost:8000/admin/

**RabbitMQ Management**:
- URL: http://localhost:15672
- Username: guest
- Password: guest

**PostgreSQL Database**:
- Host: localhost
- Port: 5432
- Database: university_lms
- Username: postgres
- Password: postgres123

### 3. Run Database Migrations

The backend container needs to run migrations:

```bash
docker compose exec backend python manage.py migrate
```

### 4. Create Superuser

```bash
docker compose exec backend python manage.py shell -c "from apps.authentication.models import User; User.objects.create_superuser(email='admin@university.edu', password='admin123', first_name='System', last_name='Administrator') if not User.objects.filter(email='admin@university.edu').exists() else print('Superuser already exists')"
```

### 5. Check Logs

**All services**:
```bash
docker compose logs -f
```

**Specific service**:
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

## Troubleshooting

### Backend Container Fails
```bash
# Check backend logs
docker compose logs backend

# Common issues:
# - Database not ready: Wait for postgres health check
# - Missing migrations: Run migrations manually
# - Package installation failed: Rebuild with --no-cache
```

### Frontend Container Fails
```bash
# Check frontend logs
docker compose logs frontend

# Common issues:
# - Node modules not installed: Rebuild container
# - Port 3000 already in use: Stop conflicting service
# - API connection failed: Check backend is running
```

### Database Connection Issues
```bash
# Check PostgreSQL status
docker compose logs postgres

# Verify database health
docker compose exec postgres pg_isready -U postgres

# Connect to database
docker compose exec postgres psql -U postgres -d university_lms
```

### Rebuild Containers
```bash
# Rebuild all containers
docker compose up --build

# Rebuild specific service
docker compose up --build backend

# Rebuild without cache
docker compose build --no-cache
```

## Docker Commands Reference

### Start Services
```bash
# Start all services
docker compose up -d

# Start specific service
docker compose up -d backend
```

### Stop Services
```bash
# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

### View Container Status
```bash
# List running containers
docker ps

# View all containers
docker ps -a

# View resource usage
docker stats
```

### Execute Commands in Containers
```bash
# Django shell
docker compose exec backend python manage.py shell

# Database shell
docker compose exec backend python manage.py dbshell

# Bash in container
docker compose exec backend bash
```

## Testing Checklist

Once containers are running, test:

- [ ] Frontend loads at http://localhost:3000
- [ ] Login page displays correctly
- [ ] Can log in with admin credentials
- [ ] Dashboard displays after login
- [ ] Backend API accessible at http://localhost:8000
- [ ] Swagger docs load at http://localhost:8000/api/docs/
- [ ] Admin panel accessible at http://localhost:8000/admin/
- [ ] RabbitMQ management UI at http://localhost:15672
- [ ] Database connection successful
- [ ] Celery worker processing tasks
- [ ] Redis caching working

## Next Steps After Successful Docker Test

1. **Test API Endpoints**
   - Register new user
   - Login and get JWT tokens
   - Create student
   - Create staff member
   - Process payment

2. **Test Frontend Features**
   - Navigation
   - Forms
   - Data display
   - Error handling
   - Loading states

3. **Integration Testing**
   - End-to-end user flows
   - Payment processing
   - File uploads
   - Notifications

4. **Performance Testing**
   - Load testing
   - Database query optimization
   - Caching effectiveness

5. **Production Preparation**
   - Environment variables
   - SSL certificates
   - Security hardening
   - Backup strategy
   - Monitoring setup

## Clean Up

To completely remove all Docker resources:

```bash
# Stop and remove containers, networks
docker compose down

# Also remove volumes (WARNING: This deletes all data)
docker compose down -v

# Remove all unused Docker resources
docker system prune -a --volumes
```

## Notes

- First build takes longer due to image downloads
- Subsequent builds are faster (uses cache)
- Development mode has hot reload enabled
- Production mode (with nginx profile) requires separate build
- Database data persists in Docker volumes
- Backend runs on Django dev server in development
- Frontend runs on Next.js dev server with hot reload
