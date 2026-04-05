#!/bin/bash

# ===========================================
# EBKUST University Management System
# Production Deployment Script
# ===========================================
#
# This script automates the production deployment process
#
# Usage:
#   ./scripts/deploy-production.sh [options]
#
# Options:
#   --build          Rebuild all images
#   --migrate        Run database migrations
#   --collect-static Collect static files
#   --backup         Create backup before deployment
#   --help           Show this help message
#
# ===========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Flags
BUILD_FLAG=false
MIGRATE_FLAG=false
COLLECT_STATIC_FLAG=false
BACKUP_FLAG=false

# ===========================================
# Functions
# ===========================================

print_header() {
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

show_help() {
    cat << EOF
EBKUST University Management System - Production Deployment Script

Usage: ./scripts/deploy-production.sh [options]

Options:
    --build          Rebuild all Docker images
    --migrate        Run database migrations
    --collect-static Collect static files
    --backup         Create database backup before deployment
    --help           Show this help message

Examples:
    # Full deployment with rebuild
    ./scripts/deploy-production.sh --build --migrate --collect-static

    # Update with backup
    ./scripts/deploy-production.sh --backup --migrate

    # Quick restart
    ./scripts/deploy-production.sh

For more information, see DOCKER_DEPLOYMENT_GUIDE.md
EOF
    exit 0
}

check_requirements() {
    print_header "Checking Requirements"

    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker is installed"

    # Check if docker-compose is installed
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    print_success "Docker Compose is installed"

    # Check if .env.production exists
    if [ ! -f "$ENV_FILE" ]; then
        print_error "$ENV_FILE not found"
        print_info "Copy .env.production.example to $ENV_FILE and configure it"
        exit 1
    fi
    print_success "Environment file found"

    echo ""
}

create_backup() {
    print_header "Creating Database Backup"

    mkdir -p "$BACKUP_DIR"

    BACKUP_FILE="$BACKUP_DIR/university_lms_$DATE.sql"

    if docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U postgres university_lms > "$BACKUP_FILE"; then
        gzip "$BACKUP_FILE"
        print_success "Backup created: $BACKUP_FILE.gz"
    else
        print_error "Backup failed"
        exit 1
    fi

    echo ""
}

build_images() {
    print_header "Building Docker Images"

    if docker-compose -f "$COMPOSE_FILE" build --no-cache; then
        print_success "Images built successfully"
    else
        print_error "Build failed"
        exit 1
    fi

    echo ""
}

start_services() {
    print_header "Starting Services"

    if docker-compose -f "$COMPOSE_FILE" up -d; then
        print_success "Services started"
    else
        print_error "Failed to start services"
        exit 1
    fi

    echo ""
}

run_migrations() {
    print_header "Running Database Migrations"

    if docker-compose -f "$COMPOSE_FILE" exec backend python manage.py migrate; then
        print_success "Migrations completed"
    else
        print_error "Migrations failed"
        exit 1
    fi

    echo ""
}

collect_static() {
    print_header "Collecting Static Files"

    if docker-compose -f "$COMPOSE_FILE" exec backend python manage.py collectstatic --noinput; then
        print_success "Static files collected"
    else
        print_error "Static collection failed"
        exit 1
    fi

    echo ""
}

check_health() {
    print_header "Checking Service Health"

    sleep 10  # Wait for services to start

    # Check backend health
    if curl -f http://localhost/api/v1/health/ > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed"
    fi

    # Check Rust API health
    if curl -f http://localhost/api/v2/health > /dev/null 2>&1; then
        print_success "Rust API is healthy"
    else
        print_warning "Rust API health check failed"
    fi

    # Check frontend health
    if curl -f http://localhost > /dev/null 2>&1; then
        print_success "Frontend is accessible"
    else
        print_warning "Frontend health check failed"
    fi

    echo ""
}

show_status() {
    print_header "Service Status"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
}

show_logs() {
    print_header "Recent Logs"
    docker-compose -f "$COMPOSE_FILE" logs --tail=50
    echo ""
}

print_completion() {
    print_header "Deployment Complete"
    echo -e "${GREEN}🎉 Production deployment successful!${NC}"
    echo ""
    echo -e "${BLUE}Access your application:${NC}"
    echo -e "  Frontend: https://yourdomain.com"
    echo -e "  Admin Panel: https://yourdomain.com/admin"
    echo -e "  API v1: https://yourdomain.com/api/v1/"
    echo -e "  API v2: https://yourdomain.com/api/v2/"
    echo ""
    echo -e "${BLUE}Useful commands:${NC}"
    echo -e "  View logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo -e "  Restart: docker-compose -f $COMPOSE_FILE restart"
    echo -e "  Stop: docker-compose -f $COMPOSE_FILE down"
    echo ""
}

# ===========================================
# Parse Arguments
# ===========================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --build)
            BUILD_FLAG=true
            shift
            ;;
        --migrate)
            MIGRATE_FLAG=true
            shift
            ;;
        --collect-static)
            COLLECT_STATIC_FLAG=true
            shift
            ;;
        --backup)
            BACKUP_FLAG=true
            shift
            ;;
        --help)
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# ===========================================
# Main Deployment Process
# ===========================================

print_header "EBKUST University Production Deployment"
echo -e "${BLUE}Date: $(date)${NC}"
echo ""

# Step 1: Check requirements
check_requirements

# Step 2: Create backup if requested
if [ "$BACKUP_FLAG" = true ]; then
    create_backup
fi

# Step 3: Build images if requested
if [ "$BUILD_FLAG" = true ]; then
    build_images
fi

# Step 4: Start services
start_services

# Step 5: Run migrations if requested
if [ "$MIGRATE_FLAG" = true ]; then
    run_migrations
fi

# Step 6: Collect static files if requested
if [ "$COLLECT_STATIC_FLAG" = true ]; then
    collect_static
fi

# Step 7: Check health
check_health

# Step 8: Show status
show_status

# Step 9: Print completion message
print_completion

exit 0
