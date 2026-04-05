#!/bin/bash
# Docker Configuration Fixes - Apply in order

echo "=== Docker Setup Fixes ==="
echo ""
echo "CRITICAL FIXES REQUIRED:"
echo ""

# Fix 1: Nginx daemon off
echo "1. Adding 'daemon off;' to nginx.conf..."
cat << 'EOF' > ./docker/nginx/nginx.conf
daemon off;
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    gzip on;
    gzip_disable "msie6";
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # Upstream for Django backend (v1 API)
    upstream django_backend {
        server backend:8000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # Upstream for Rust API (v2 API)
    upstream rust_api {
        server rust-api:8081 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # Upstream for Next.js frontend
    upstream nextjs_frontend {
        server frontend:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    server {
        listen 80;
        server_name localhost;

        # Health check endpoint
        location /health {
            access_log off;
            add_header Content-Type text/plain;
            return 200 "healthy\n";
        }

        # Django Admin (always goes to Django)
        location /admin {
            proxy_pass http://django_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;
            proxy_buffering off;
        }

        # Django API v1 (legacy/main API)
        location /api/v1/ {
            proxy_pass http://django_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;

            # Timeout settings for long-running requests
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # Rust API v2 (new high-performance API)
        location /api/v2/ {
            proxy_pass http://rust_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;

            # Rust is fast, use shorter timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Static files (Django staticfiles)
        location /static/ {
            alias /var/www/static/;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # Media files (user uploads)
        location /media/ {
            alias /var/www/media/;
            expires 7d;
            add_header Cache-Control "public";
        }

        # Next.js frontend (all other routes)
        location / {
            proxy_pass http://nextjs_frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_redirect off;
        }

        # Next.js hot reload (development)
        location /_next/webpack-hmr {
            proxy_pass http://nextjs_frontend/_next/webpack-hmr;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
EOF
echo "✅ Fixed: nginx.conf with daemon off"
echo ""

# Fix 2: Environment variables
echo "2. Updating .env with correct service names..."
cat << 'EOF' > ./.env.fixed
# DATABASE CONFIGURATION
POSTGRES_DB=university_lms
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/university_lms
DB_NAME=university_lms
DB_USER=postgres
DB_PASSWORD=postgres123
DB_HOST=postgres
DB_PORT=5432

# DJANGO CONFIGURATION
SECRET_KEY=django-insecure-test-key-for-docker-development-only-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,backend,nginx
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://frontend:3000

# REDIS CONFIGURATION
REDIS_URL=redis://redis:6379/0
CACHE_TTL=300

# CELERY CONFIGURATION
CELERY_BROKER_URL=amqp://guest:guest@rabbitmq:5672//
CELERY_RESULT_BACKEND=redis://redis:6379/1

# RABBITMQ CONFIGURATION
RABBITMQ_USER=guest
RABBITMQ_PASS=guest

# EMAIL CONFIGURATION
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# FRONTEND CONFIGURATION (FIXED - use service names for internal requests)
NEXT_PUBLIC_API_URL=http://backend:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://backend:8000/ws
NEXT_PUBLIC_APP_NAME=University LMS
NEXT_PUBLIC_APP_URL=http://localhost:3000

# RUST API CONFIGURATION
RUST_API_URL=http://rust-api:8081
RUST_LOG=api=debug,shared=debug,sqlx=warn

# JWT CONFIGURATION
JWT_SECRET=your_jwt_secret_key_different_from_django_secret
EOF

echo "✅ Created: .env.fixed with corrected values"
echo "   To apply: mv .env .env.backup && mv .env.fixed .env"
echo ""

# Fix 3: Production environment template
echo "3. Creating .env.production template..."
cat << 'EOF' > ./.env.production.template
# =============================================
# PRODUCTION ENVIRONMENT CONFIGURATION
# =============================================
# IMPORTANT: Change ALL default values before deploying!

# DATABASE CONFIGURATION
POSTGRES_DB=university_lms
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
DATABASE_URL=postgresql://postgres:CHANGE_ME_STRONG_PASSWORD@postgres:5432/university_lms
DB_NAME=university_lms
DB_USER=postgres
DB_PASSWORD=CHANGE_ME_STRONG_PASSWORD

# DJANGO CONFIGURATION
SECRET_KEY=CHANGE_ME_GENERATE_NEW_SECRET_KEY_MIN_50_CHARS
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# REDIS CONFIGURATION
REDIS_URL=redis://redis:6379/0
CACHE_TTL=300

# CELERY CONFIGURATION
CELERY_BROKER_URL=amqp://CHANGE_ME_RABBITMQ_USER:CHANGE_ME_RABBITMQ_PASS@rabbitmq:5672//
CELERY_RESULT_BACKEND=redis://redis:6379/1

# RABBITMQ CONFIGURATION
RABBITMQ_USER=CHANGE_ME_SECURE_USER
RABBITMQ_PASS=CHANGE_ME_STRONG_PASSWORD

# EMAIL CONFIGURATION
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# FRONTEND CONFIGURATION (use service names for docker, full URLs for browser)
NEXT_PUBLIC_API_URL=http://backend:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://backend:8000/ws
NEXT_PUBLIC_APP_NAME=University LMS
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# RUST API CONFIGURATION
RUST_API_URL=http://rust-api:8081
RUST_LOG=api=info,shared=info,sqlx=warn

# JWT CONFIGURATION
JWT_SECRET=CHANGE_ME_GENERATE_NEW_SECRET_KEY_MIN_32_CHARS

# SECURITY
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
EOF

echo "✅ Created: .env.production.template"
echo "   To apply: cp .env.production.template .env.production && edit with real values"
echo ""

# Fix 4: Create missing production files
echo "4. Creating missing production configuration files..."

mkdir -p ./docker/postgres ./docker/rabbitmq

# PostgreSQL init script
cat << 'EOF' > ./docker/postgres/init.sql
-- University LMS Database Initialization
-- This script runs once when postgres container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS jsonb_plpythonu;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE university_lms TO postgres;
EOF
echo "✅ Created: docker/postgres/init.sql"

# RabbitMQ config
cat << 'EOF' > ./docker/rabbitmq/rabbitmq.conf
# RabbitMQ Production Configuration

# Network & Protocol
listeners.ssl.default = 5671

# Memory
vm_memory_high_watermark.relative = 0.6
vm_memory_high_watermark_paging_ratio = 0.75

# Message TTL
max_message_size = 134217728

# Queue Master Location
queue_master_locator = min-masters

# Logging
log.file.level = warning
log.console = true
log.console.level = warning
EOF
echo "✅ Created: docker/rabbitmq/rabbitmq.conf"

# Nginx production config
cat << 'EOF' > ./docker/nginx/nginx.prod.conf
daemon off;
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # Upstream definitions
    upstream django_backend {
        server backend:8000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream rust_api {
        server rust-api:8081 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream nextjs_frontend {
        server frontend:3000 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        # SSL certificates (update paths)
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Health check
        location /health {
            access_log off;
            add_header Content-Type text/plain;
            return 200 "healthy\n";
        }

        # Admin
        location /admin {
            proxy_pass http://django_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;
        }

        # API v1
        location /api/v1/ {
            proxy_pass http://django_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # API v2
        location /api/v2/ {
            proxy_pass http://rust_api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_redirect off;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Static files (cached)
        location /static/ {
            alias /var/www/static/;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # Media files
        location /media/ {
            alias /var/www/media/;
            expires 7d;
            add_header Cache-Control "public";
        }

        # Frontend
        location / {
            proxy_pass http://nextjs_frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_redirect off;
        }
    }
}
EOF
echo "✅ Created: docker/nginx/nginx.prod.conf"

echo ""
echo "=== FIXES COMPLETE ==="
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Review and apply .env changes:"
echo "   mv .env .env.backup"
echo "   mv .env.fixed .env"
echo ""
echo "2. Create production environment:"
echo "   cp .env.production.template .env.production"
echo "   nano .env.production  # Edit with real values"
echo ""
echo "3. Update SSL certificates for production:"
echo "   mkdir -p docker/nginx/ssl"
echo "   # Place your cert.pem and key.pem in docker/nginx/ssl/"
echo ""
echo "4. Test development environment:"
echo "   docker compose down -v"
echo "   docker compose up -d"
echo "   docker compose ps"
echo ""
echo "5. Test all services are healthy:"
echo "   docker compose ps  # Check STATUS column"
echo "   docker compose logs -f nginx"
echo ""
