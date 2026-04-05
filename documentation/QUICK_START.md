# QUICK START - START HERE ⚡

**Estimated Time:** 30 minutes to get running  
**Difficulty:** Beginner-friendly  
**What You'll Have:** Full app running locally

---

## STEP 1: Verify Docker Installation (5 min)

```bash
# Check Docker is installed
docker --version
# Expected: Docker version 20.10+

docker compose --version
# Expected: Docker Compose version 2.0+

# If not installed, get Docker Desktop from https://www.docker.com/products/docker-desktop
```

---

## STEP 2: Start Everything (5 min)

```bash
# Navigate to project
cd C:\Users\Wisdom\source\repos\UNIVERSITY

# Start all services
docker compose up -d

# Wait for services to start (about 30 seconds)
# Services are starting in parallel...
```

---

## STEP 3: Verify It's Working (5 min)

```bash
# Check all services are healthy
docker compose ps

# You should see:
# ✅ university_postgres   Up    Healthy
# ✅ university_redis      Up    Healthy  
# ✅ university_rabbitmq   Up    Healthy
# ✅ university_backend    Up    Healthy
# ✅ university_frontend   Up    Healthy
# ✅ university_rust_api   Up    Healthy
# ✅ university_nginx      Up    Healthy
# ✅ university_celery_worker  Up
# ✅ university_celery_beat    Up

# If any are not healthy, wait 10 more seconds and check again
docker compose ps
```

---

## STEP 4: Test the Application (10 min)

### Open in Browser:

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main app |
| **API (v1)** | http://localhost:8000 | Django REST API |
| **API (v2)** | http://localhost:8081 | Rust API |
| **Admin** | http://localhost:8000/admin | Django Admin |
| **RabbitMQ** | http://localhost:15672 | Message Queue (guest/guest) |
| **Gateway** | http://localhost | Nginx reverse proxy |

```bash
# Or test from command line:

# Test frontend loads
curl http://localhost:3000

# Test Django API
curl http://localhost:8000/api/v1/

# Test Rust API
curl http://localhost:8081/

# Test health checks
curl http://localhost/health
```

---

## STEP 5: Next Steps (Choose One)

### Option A: Just Explore (30 min)
```bash
# View logs to see what's happening
docker compose logs -f frontend    # See frontend logs
docker compose logs -f backend     # See Django logs
docker compose logs -f rust-api    # See Rust logs

# Ctrl+C to exit logs
```

### Option B: Create Admin Account (15 min)
```bash
# Run migrations
docker compose exec backend python manage.py migrate

# Create superuser
docker compose exec backend python manage.py createsuperuser
# Follow prompts to create admin account

# Access admin at: http://localhost:8000/admin
# Login with credentials you just created
```

### Option C: Run Tests (20 min)
```bash
# Run Python tests
docker compose exec backend python -m pytest

# Run Node tests
docker compose exec frontend npm test

# Run Rust tests
docker compose exec rust-api cargo test
```

---

## STOP EVERYTHING (When Done)

```bash
# Stop all services (data persists)
docker compose stop

# Completely remove (if you want to clean up)
docker compose down

# Remove everything including data (CAUTION!)
docker compose down -v
```

---

## MOST COMMON ISSUES & FIXES

### Issue: "Port 3000 already in use"
```bash
# Find what's using it
netstat -ano | findstr :3000

# Stop it or use different port
docker compose.yml # Change port 3000 to 3001
```

### Issue: "Docker daemon not running"
```bash
# Start Docker Desktop (GUI on Windows/Mac)
# Or on Linux: sudo systemctl start docker
```

### Issue: "Services won't start"
```bash
# Check logs
docker compose logs

# Try rebuilding
docker compose build --no-cache

# Try fresh start
docker compose down -v
docker compose up -d
```

### Issue: "Can't access http://localhost:3000"
```bash
# Check if frontend is running
docker compose ps frontend

# Check logs
docker compose logs frontend

# Try waiting 30 more seconds (first start is slow)
Start-Sleep -Seconds 30
docker compose ps
```

---

## WHAT'S RUNNING WHERE

```
🖥️  Frontend (React/Next.js)
    ├─ http://localhost:3000
    ├─ Talks to: Backend API
    └─ Files: ./frontend

🔌 Backend APIs
    ├─ Django (v1)
    │  ├─ http://localhost:8000/api/v1/
    │  ├─ Admin: http://localhost:8000/admin
    │  └─ Files: ./backend
    │
    └─ Rust (v2)
       ├─ http://localhost:8081/
       └─ Files: ./rust

🗄️  Databases
    ├─ PostgreSQL (port 5432, internal)
    │  └─ Stores: Users, courses, data
    ├─ Redis (port 6379, internal)
    │  └─ Caches: Sessions, results
    └─ RabbitMQ (port 5672, internal)
       └─ Queues: Email, SMS, exports

⚙️  Workers
    ├─ Celery Worker
    │  └─ Processes: Async tasks
    └─ Celery Beat
       └─ Schedules: Cron jobs

🌐 Gateway
    └─ Nginx (port 80)
       └─ Routes: All requests to correct service
```

---

## QUICK REFERENCE

### View Logs
```bash
docker compose logs -f <service>  # Stream logs
docker compose logs --tail 50     # Last 50 lines
docker compose logs backend       # Specific service
```

### Run Commands
```bash
docker compose exec backend python manage.py createsuperuser
docker compose exec frontend npm install
docker compose exec rust-api cargo test
```

### Restart Services
```bash
docker compose restart           # Restart all
docker compose restart backend   # Restart one
```

### View Status
```bash
docker compose ps               # Status of all services
docker stats                    # CPU/Memory usage
```

### Remove Everything
```bash
docker compose down -v          # Remove volumes (deletes data!)
docker system prune             # Clean up unused Docker stuff
```

---

## COMMON WORKFLOWS

### I want to see errors
```bash
docker compose logs -f backend | grep ERROR
```

### I want to restart one service
```bash
docker compose restart frontend
```

### I want to run migrations
```bash
docker compose exec backend python manage.py migrate
```

### I want to create admin user
```bash
docker compose exec backend python manage.py createsuperuser
```

### I want to check database
```bash
docker compose exec postgres psql -U postgres -d university_lms
# Type SQL commands, then \q to exit
```

### I want to clear all data and start fresh
```bash
docker compose down -v
docker compose up -d
# All data is gone, start fresh
```

---

## TROUBLESHOOTING FLOW

**Services won't start?**
```
1. Check Docker is running
2. Check ports aren't in use: netstat -ano
3. Check disk space: df -h
4. Try restart: docker compose restart
5. Check logs: docker compose logs
```

**Slow performance?**
```
1. Check system resources: docker stats
2. Check disk space: docker system df
3. Clear unused: docker system prune
4. Check logs for errors
```

**Can't connect to API?**
```
1. Verify service is running: docker compose ps
2. Check network: docker network ls
3. Check logs: docker compose logs <service>
4. Test connectivity: docker compose exec backend curl http://backend:8000/
```

---

## BEFORE YOU GO TO PRODUCTION

After you can run locally successfully, do this:

1. **Read:** NEXT_STEPS_ROADMAP.md
2. **Run:** Security scans (pip, npm, cargo audit)
3. **Create:** Production environment (.env.production)
4. **Get:** SSL certificate (Let's Encrypt)
5. **Test:** On staging server
6. **Deploy:** To production

Estimated effort: 40 hours over 4 weeks

---

## YOU ARE HERE ✅

```
┌─ Local Development ✅ (CURRENT)
│  └─ Staging Deployment (Week 2)
│     └─ Production Deployment (Week 4)
│        └─ Monitoring & Scaling (Ongoing)
└─ YOU ARE HERE
```

Next steps:
1. Get app running ✅ (do this now - 30 min)
2. Explore the code (1-2 hours)
3. Read NEXT_STEPS_ROADMAP.md (when ready to deploy)
4. Setup staging environment (Week 2)
5. Deploy to production (Week 4)

---

## NEED HELP?

### Check These Files
- **COMPLETE_ANALYSIS_SUMMARY.md** - Full overview
- **NEXT_STEPS_ROADMAP.md** - Detailed 8-week plan
- **DOCKER_ANALYSIS_REPORT.md** - Technical deep-dive
- **PROJECT_STRUCTURE_ANALYSIS.md** - Code organization

### Useful Commands
```bash
docker compose --help           # Docker Compose help
docker compose logs --help      # Logging help
docker ps --help                # Container help
curl --help                      # HTTP testing help
```

### Resources
- https://docs.docker.com/
- https://docs.djangoproject.com/
- https://nextjs.org/docs
- https://www.rust-lang.org/

---

## THAT'S IT! 🚀

You now have the University LMS running locally. Explore, test, and when ready for production, follow the NEXT_STEPS_ROADMAP.md file.

**Questions?** All answers are in the analysis documents generated.

