#!/bin/bash

# ===========================================
# EBKUST University Management System
# Docker Setup Testing Script
# ===========================================
#
# This script tests the Docker setup to ensure
# everything is configured correctly
#
# Usage:
#   ./scripts/test-docker-setup.sh [development|production]
#
# ===========================================

set -e

# Configuration
ENVIRONMENT=${1:-development}
TEST_RESULTS_DIR="test-results"
DATE=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="$TEST_RESULTS_DIR/docker_test_$ENVIRONMENT_$DATE.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# ===========================================
# Helper Functions
# ===========================================

print_header() {
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=========================================${NC}"
}

print_test() {
    echo -e "${BLUE}[TEST] $1${NC}"
}

print_success() {
    echo -e "${GREEN}  ✓ $1${NC}"
    ((TESTS_PASSED++))
}

print_fail() {
    echo -e "${RED}  ✗ $1${NC}"
    ((TESTS_FAILED++))
}

print_info() {
    echo -e "${YELLOW}  ℹ $1${NC}"
}

run_test() {
    ((TESTS_TOTAL++))
}

# ===========================================
# Test Functions
# ===========================================

test_docker_installed() {
    run_test
    print_test "Checking if Docker is installed"

    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker is installed: $DOCKER_VERSION"
        return 0
    else
        print_fail "Docker is not installed"
        return 1
    fi
}

test_docker_compose_installed() {
    run_test
    print_test "Checking if Docker Compose is installed"

    if docker compose version &> /dev/null 2>&1; then
        COMPOSE_VERSION=$(docker compose version)
        print_success "Docker Compose is installed: $COMPOSE_VERSION"
        return 0
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version)
        print_success "Docker Compose is installed: $COMPOSE_VERSION"
        return 0
    else
        print_fail "Docker Compose is not installed"
        return 1
    fi
}

test_docker_running() {
    run_test
    print_test "Checking if Docker daemon is running"

    if docker info &> /dev/null; then
        print_success "Docker daemon is running"
        return 0
    else
        print_fail "Docker daemon is not running"
        print_info "Start Docker Desktop or run: sudo systemctl start docker"
        return 1
    fi
}

test_env_file_exists() {
    run_test
    print_test "Checking environment file"

    if [ "$ENVIRONMENT" = "production" ]; then
        ENV_FILE=".env.production"
    else
        ENV_FILE=".env"
    fi

    if [ -f "$ENV_FILE" ]; then
        print_success "Environment file found: $ENV_FILE"
        return 0
    else
        print_fail "Environment file not found: $ENV_FILE"
        print_info "Copy from ${ENV_FILE}.example"
        return 1
    fi
}

test_required_env_vars() {
    run_test
    print_test "Checking required environment variables"

    if [ "$ENVIRONMENT" = "production" ]; then
        ENV_FILE=".env.production"
    else
        ENV_FILE=".env"
    fi

    REQUIRED_VARS=("POSTGRES_PASSWORD" "SECRET_KEY")
    MISSING_VARS=()

    for VAR in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^${VAR}=" "$ENV_FILE" 2>/dev/null; then
            MISSING_VARS+=("$VAR")
        fi
    done

    if [ ${#MISSING_VARS[@]} -eq 0 ]; then
        print_success "All required environment variables are set"
        return 0
    else
        print_fail "Missing required variables: ${MISSING_VARS[*]}"
        return 1
    fi
}

test_compose_file_exists() {
    run_test
    print_test "Checking docker-compose file"

    if [ "$ENVIRONMENT" = "production" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    else
        COMPOSE_FILE="docker-compose.yml"
    fi

    if [ -f "$COMPOSE_FILE" ]; then
        print_success "Compose file found: $COMPOSE_FILE"
        return 0
    else
        print_fail "Compose file not found: $COMPOSE_FILE"
        return 1
    fi
}

test_compose_syntax() {
    run_test
    print_test "Validating docker-compose syntax"

    if [ "$ENVIRONMENT" = "production" ]; then
        COMPOSE_FILE="docker-compose.prod.yml"
    else
        COMPOSE_FILE="docker-compose.yml"
    fi

    if docker-compose -f "$COMPOSE_FILE" config > /dev/null 2>&1; then
        print_success "Docker Compose syntax is valid"
        return 0
    else
        print_fail "Docker Compose syntax validation failed"
        return 1
    fi
}

test_dockerfile_exists() {
    run_test
    print_test "Checking Dockerfiles"

    MISSING_FILES=()

    if [ ! -f "frontend/Dockerfile" ]; then
        MISSING_FILES+=("frontend/Dockerfile")
    fi

    if [ ! -f "backend/Dockerfile" ]; then
        MISSING_FILES+=("backend/Dockerfile")
    fi

    if [ ${#MISSING_FILES[@]} -eq 0 ]; then
        print_success "All Dockerfiles exist"
        return 0
    else
        print_fail "Missing Dockerfiles: ${MISSING_FILES[*]}"
        return 1
    fi
}

test_port_availability() {
    run_test
    print_test "Checking port availability"

    PORTS=(80 443 3000 8000 8081 5432 6379 5672 15672)
    PORTS_IN_USE=()

    for PORT in "${PORTS[@]}"; do
        if lsof -i :$PORT &> /dev/null || netstat -tuln 2>/dev/null | grep -q ":$PORT "; then
            PORTS_IN_USE+=("$PORT")
        fi
    done

    if [ ${#PORTS_IN_USE[@]} -eq 0 ]; then
        print_success "All required ports are available"
        return 0
    else
        print_fail "Ports in use: ${PORTS_IN_USE[*]}"
        print_info "Stop services using these ports or use docker-compose down"
        return 1
    fi
}

test_disk_space() {
    run_test
    print_test "Checking disk space"

    AVAILABLE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
    REQUIRED=10

    if [ "$AVAILABLE" -ge "$REQUIRED" ]; then
        print_success "Sufficient disk space: ${AVAILABLE}GB available"
        return 0
    else
        print_fail "Insufficient disk space: ${AVAILABLE}GB available, ${REQUIRED}GB required"
        return 1
    fi
}

test_memory() {
    run_test
    print_test "Checking available memory"

    if command -v free &> /dev/null; then
        AVAILABLE=$(free -g | grep Mem | awk '{print $7}')
        REQUIRED=2

        if [ "$AVAILABLE" -ge "$REQUIRED" ]; then
            print_success "Sufficient memory: ${AVAILABLE}GB available"
            return 0
        else
            print_fail "Insufficient memory: ${AVAILABLE}GB available, ${REQUIRED}GB recommended"
            return 1
        fi
    else
        print_info "Memory check skipped (free command not available)"
        return 0
    fi
}

test_docker_network() {
    run_test
    print_test "Testing Docker network connectivity"

    if docker network ls &> /dev/null; then
        print_success "Docker network is accessible"
        return 0
    else
        print_fail "Docker network is not accessible"
        return 1
    fi
}

test_docker_volumes() {
    run_test
    print_test "Testing Docker volumes"

    if docker volume ls &> /dev/null; then
        print_success "Docker volumes are accessible"
        return 0
    else
        print_fail "Docker volumes are not accessible"
        return 1
    fi
}

test_nginx_config() {
    run_test
    print_test "Checking Nginx configuration"

    if [ "$ENVIRONMENT" = "production" ]; then
        NGINX_CONF="docker/nginx/nginx.prod.conf"
    else
        NGINX_CONF="docker/nginx/nginx.conf"
    fi

    if [ -f "$NGINX_CONF" ]; then
        print_success "Nginx configuration found: $NGINX_CONF"
        return 0
    else
        print_fail "Nginx configuration not found: $NGINX_CONF"
        return 1
    fi
}

test_ssl_certificates() {
    run_test

    if [ "$ENVIRONMENT" = "production" ]; then
        print_test "Checking SSL certificates"

        SSL_DIR="docker/nginx/ssl"

        if [ -f "$SSL_DIR/cert.pem" ] && [ -f "$SSL_DIR/key.pem" ]; then
            print_success "SSL certificates found"
            return 0
        else
            print_fail "SSL certificates not found in $SSL_DIR"
            print_info "Generate with: sudo certbot certonly --standalone -d yourdomain.com"
            return 1
        fi
    else
        print_info "SSL certificate check skipped (development mode)"
        return 0
    fi
}

test_build_frontend() {
    run_test
    print_test "Testing frontend Docker build"

    print_info "Building frontend image (this may take a few minutes)..."

    if docker build -t ebkust-frontend-test ./frontend --target development > /dev/null 2>&1; then
        print_success "Frontend image builds successfully"
        docker rmi ebkust-frontend-test > /dev/null 2>&1 || true
        return 0
    else
        print_fail "Frontend build failed"
        print_info "Check frontend/Dockerfile for errors"
        return 1
    fi
}

test_build_backend() {
    run_test
    print_test "Testing backend Docker build"

    print_info "Building backend image (this may take a few minutes)..."

    if docker build -t ebkust-backend-test ./backend > /dev/null 2>&1; then
        print_success "Backend image builds successfully"
        docker rmi ebkust-backend-test > /dev/null 2>&1 || true
        return 0
    else
        print_fail "Backend build failed"
        print_info "Check backend/Dockerfile for errors"
        return 1
    fi
}

# ===========================================
# Main Testing Process
# ===========================================

mkdir -p "$TEST_RESULTS_DIR"

print_header "EBKUST University Docker Setup Tests"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}Date: $(date)${NC}"
echo ""

{
    echo "========================================="
    echo "EBKUST University Docker Setup Tests"
    echo "Environment: $ENVIRONMENT"
    echo "Date: $(date)"
    echo "========================================="
    echo ""
} > "$RESULTS_FILE"

# Run all tests
print_header "System Requirements"
test_docker_installed | tee -a "$RESULTS_FILE"
test_docker_compose_installed | tee -a "$RESULTS_FILE"
test_docker_running | tee -a "$RESULTS_FILE"
test_disk_space | tee -a "$RESULTS_FILE"
test_memory | tee -a "$RESULTS_FILE"
echo ""

print_header "Configuration Files"
test_env_file_exists | tee -a "$RESULTS_FILE"
test_required_env_vars | tee -a "$RESULTS_FILE"
test_compose_file_exists | tee -a "$RESULTS_FILE"
test_compose_syntax | tee -a "$RESULTS_FILE"
test_dockerfile_exists | tee -a "$RESULTS_FILE"
test_nginx_config | tee -a "$RESULTS_FILE"
test_ssl_certificates | tee -a "$RESULTS_FILE"
echo ""

print_header "Docker Environment"
test_docker_network | tee -a "$RESULTS_FILE"
test_docker_volumes | tee -a "$RESULTS_FILE"
test_port_availability | tee -a "$RESULTS_FILE"
echo ""

print_header "Build Tests (Optional - Skip if running services)"
echo -e "${YELLOW}Press Enter to run build tests, or Ctrl+C to skip...${NC}"
read -t 10 || echo "Skipping build tests..."

if [ $? -eq 0 ]; then
    test_build_frontend | tee -a "$RESULTS_FILE"
    test_build_backend | tee -a "$RESULTS_FILE"
fi
echo ""

# ===========================================
# Results Summary
# ===========================================

print_header "Test Results Summary"

echo -e "${BLUE}Total Tests: $TESTS_TOTAL${NC}"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

{
    echo ""
    echo "========================================="
    echo "Summary"
    echo "========================================="
    echo "Total Tests: $TESTS_TOTAL"
    echo "Passed: $TESTS_PASSED"
    echo "Failed: $TESTS_FAILED"
} >> "$RESULTS_FILE"

echo ""
echo -e "${BLUE}Full results saved to: $RESULTS_FILE${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo -e "${GREEN}Your Docker setup is ready for deployment!${NC}"
    echo ""

    if [ "$ENVIRONMENT" = "production" ]; then
        echo -e "${BLUE}Next steps:${NC}"
        echo "  1. Review .env.production for secure credentials"
        echo "  2. Run: ./scripts/deploy-production.sh --build --migrate"
    else
        echo -e "${BLUE}Next steps:${NC}"
        echo "  1. Run: docker-compose up -d"
        echo "  2. Access: http://localhost:3000"
    fi
    exit 0
else
    echo -e "${RED}=========================================${NC}"
    echo -e "${RED}✗ Some tests failed${NC}"
    echo -e "${RED}=========================================${NC}"
    echo ""
    echo -e "${YELLOW}Please fix the issues above before deploying${NC}"
    echo ""
    echo -e "${BLUE}Common fixes:${NC}"
    echo "  - Install Docker: curl -fsSL https://get.docker.com | sh"
    echo "  - Create .env file: cp .env.example .env"
    echo "  - Free up ports: docker-compose down"
    echo "  - Free disk space: docker system prune -a"
    exit 1
fi
