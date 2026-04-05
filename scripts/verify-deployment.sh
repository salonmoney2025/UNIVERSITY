#!/bin/bash

# ===========================================
# EBKUST University Management System
# Deployment Verification Script
# ===========================================
#
# This script verifies that the deployment was successful
# by running comprehensive health checks
#
# Usage:
#   ./scripts/verify-deployment.sh [production|staging|development]
#
# ===========================================

set -e

# Configuration
ENVIRONMENT=${1:-production}
TIMEOUT=30
RETRY_COUNT=3
RETRY_DELAY=10

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_TOTAL=0

# ===========================================
# Configuration
# ===========================================

if [ "$ENVIRONMENT" = "production" ]; then
    BASE_URL="https://ebkustsl.edu.sl"
    COMPOSE_FILE="docker-compose.prod.yml"
elif [ "$ENVIRONMENT" = "staging" ]; then
    BASE_URL="https://staging.ebkustsl.edu.sl"
    COMPOSE_FILE="docker-compose.yml"
else
    BASE_URL="http://localhost"
    COMPOSE_FILE="docker-compose.yml"
fi

# ===========================================
# Helper Functions
# ===========================================

print_header() {
    echo ""
    echo -e "${BLUE}=========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=========================================${NC}"
}

print_check() {
    echo -e "${BLUE}[CHECK] $1${NC}"
}

print_success() {
    echo -e "${GREEN}  ✓ $1${NC}"
    ((CHECKS_PASSED++))
}

print_fail() {
    echo -e "${RED}  ✗ $1${NC}"
    ((CHECKS_FAILED++))
}

print_info() {
    echo -e "${YELLOW}  ℹ $1${NC}"
}

run_check() {
    ((CHECKS_TOTAL++))
}

make_request() {
    local URL=$1
    local EXPECTED_CODE=${2:-200}
    local RETRY=0

    while [ $RETRY -lt $RETRY_COUNT ]; do
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$URL" 2>/dev/null || echo "000")

        if [ "$HTTP_CODE" = "$EXPECTED_CODE" ]; then
            return 0
        fi

        ((RETRY++))
        if [ $RETRY -lt $RETRY_COUNT ]; then
            sleep $RETRY_DELAY
        fi
    done

    echo "$HTTP_CODE"
    return 1
}

# ===========================================
# Service Health Checks
# ===========================================

check_docker_running() {
    run_check
    print_check "Docker daemon is running"

    if docker info &> /dev/null; then
        print_success "Docker is running"
        return 0
    else
        print_fail "Docker is not running"
        return 1
    fi
}

check_containers_running() {
    run_check
    print_check "Containers are running"

    EXPECTED_CONTAINERS=(
        "postgres"
        "redis"
        "rabbitmq"
        "backend"
        "frontend"
        "nginx"
        "celery_worker"
        "celery_beat"
    )

    if [ "$ENVIRONMENT" = "production" ]; then
        EXPECTED_CONTAINERS+=("rust-api")
    fi

    ALL_RUNNING=true
    for CONTAINER in "${EXPECTED_CONTAINERS[@]}"; do
        if docker compose -f "$COMPOSE_FILE" ps | grep "$CONTAINER" | grep -q "Up"; then
            print_info "✓ $CONTAINER is running"
        else
            print_info "✗ $CONTAINER is not running"
            ALL_RUNNING=false
        fi
    done

    if [ "$ALL_RUNNING" = true ]; then
        print_success "All containers are running"
        return 0
    else
        print_fail "Some containers are not running"
        return 1
    fi
}

check_container_health() {
    run_check
    print_check "Container health status"

    UNHEALTHY_CONTAINERS=$(docker compose -f "$COMPOSE_FILE" ps --filter "health=unhealthy" -q 2>/dev/null | wc -l)

    if [ "$UNHEALTHY_CONTAINERS" -eq 0 ]; then
        print_success "All containers are healthy"
        return 0
    else
        print_fail "$UNHEALTHY_CONTAINERS unhealthy container(s)"
        return 1
    fi
}

check_disk_space() {
    run_check
    print_check "Disk space availability"

    AVAILABLE=$(df -BG . | tail -1 | awk '{print $4}' | sed 's/G//')
    THRESHOLD=5

    if [ "$AVAILABLE" -ge "$THRESHOLD" ]; then
        print_success "Sufficient disk space: ${AVAILABLE}GB available"
        return 0
    else
        print_fail "Low disk space: ${AVAILABLE}GB available"
        return 1
    fi
}

check_memory() {
    run_check
    print_check "Memory availability"

    if command -v free &> /dev/null; then
        AVAILABLE=$(free -g | grep Mem | awk '{print $7}')
        THRESHOLD=1

        if [ "$AVAILABLE" -ge "$THRESHOLD" ]; then
            print_success "Sufficient memory: ${AVAILABLE}GB available"
            return 0
        else
            print_fail "Low memory: ${AVAILABLE}GB available"
            return 1
        fi
    else
        print_info "Memory check skipped"
        return 0
    fi
}

# ===========================================
# Application Health Checks
# ===========================================

check_frontend_health() {
    run_check
    print_check "Frontend accessibility"

    if make_request "$BASE_URL"; then
        print_success "Frontend is accessible"
        return 0
    else
        print_fail "Frontend is not accessible"
        return 1
    fi
}

check_backend_api_health() {
    run_check
    print_check "Backend API health"

    if make_request "$BASE_URL/api/v1/health/"; then
        print_success "Backend API is healthy"
        return 0
    else
        print_fail "Backend API is not healthy"
        return 1
    fi
}

check_rust_api_health() {
    run_check
    print_check "Rust API health"

    if [ "$ENVIRONMENT" != "production" ]; then
        print_info "Skipped (not in production)"
        return 0
    fi

    if make_request "$BASE_URL/api/v2/health"; then
        print_success "Rust API is healthy"
        return 0
    else
        print_fail "Rust API is not healthy"
        return 1
    fi
}

check_database_connection() {
    run_check
    print_check "Database connectivity"

    if docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U postgres &> /dev/null; then
        print_success "Database is accepting connections"
        return 0
    else
        print_fail "Database is not accepting connections"
        return 1
    fi
}

check_redis_connection() {
    run_check
    print_check "Redis connectivity"

    if docker compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping | grep -q PONG; then
        print_success "Redis is responding"
        return 0
    else
        print_fail "Redis is not responding"
        return 1
    fi
}

check_rabbitmq_health() {
    run_check
    print_check "RabbitMQ health"

    if docker compose -f "$COMPOSE_FILE" exec -T rabbitmq rabbitmq-diagnostics ping &> /dev/null; then
        print_success "RabbitMQ is healthy"
        return 0
    else
        print_fail "RabbitMQ is not healthy"
        return 1
    fi
}

check_celery_worker() {
    run_check
    print_check "Celery worker status"

    if docker compose -f "$COMPOSE_FILE" exec -T celery_worker celery -A config inspect ping &> /dev/null; then
        print_success "Celery worker is responding"
        return 0
    else
        print_fail "Celery worker is not responding"
        return 1
    fi
}

# ===========================================
# Security Checks
# ===========================================

check_ssl_certificate() {
    run_check

    if [ "$ENVIRONMENT" = "production" ]; then
        print_check "SSL certificate validity"

        DOMAIN=$(echo "$BASE_URL" | sed 's|https://||' | sed 's|/.*||')
        EXPIRY=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)

        if [ -n "$EXPIRY" ]; then
            EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$EXPIRY" +%s 2>/dev/null)
            NOW_EPOCH=$(date +%s)
            DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

            if [ "$DAYS_LEFT" -gt 30 ]; then
                print_success "SSL certificate valid for $DAYS_LEFT days"
                return 0
            elif [ "$DAYS_LEFT" -gt 0 ]; then
                print_fail "SSL certificate expires in $DAYS_LEFT days (renew soon!)"
                return 1
            else
                print_fail "SSL certificate has expired!"
                return 1
            fi
        else
            print_fail "Could not verify SSL certificate"
            return 1
        fi
    else
        print_info "SSL check skipped (not in production)"
        return 0
    fi
}

check_https_redirect() {
    run_check

    if [ "$ENVIRONMENT" = "production" ]; then
        print_check "HTTP to HTTPS redirect"

        HTTP_URL=$(echo "$BASE_URL" | sed 's|https://|http://|')
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$HTTP_URL" 2>/dev/null || echo "000")

        if [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
            print_success "HTTP redirects to HTTPS"
            return 0
        else
            print_fail "HTTP does not redirect to HTTPS (got $HTTP_CODE)"
            return 1
        fi
    else
        print_info "HTTPS redirect check skipped"
        return 0
    fi
}

# ===========================================
# Performance Checks
# ===========================================

check_response_time() {
    run_check
    print_check "API response time"

    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' "$BASE_URL/api/v1/health/" 2>/dev/null || echo "999")
    THRESHOLD=2.0

    if (( $(echo "$RESPONSE_TIME < $THRESHOLD" | bc -l) )); then
        print_success "Response time: ${RESPONSE_TIME}s"
        return 0
    else
        print_fail "Response time too slow: ${RESPONSE_TIME}s"
        return 1
    fi
}

check_container_restarts() {
    run_check
    print_check "Container restart count"

    MAX_RESTARTS=3
    HIGH_RESTART_COUNT=false

    while IFS= read -r line; do
        RESTARTS=$(echo "$line" | awk '{print $4}')
        if [ "$RESTARTS" -gt "$MAX_RESTARTS" ]; then
            HIGH_RESTART_COUNT=true
            print_info "Container has restarted $RESTARTS times"
        fi
    done < <(docker compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}" | tail -n +2)

    if [ "$HIGH_RESTART_COUNT" = false ]; then
        print_success "No excessive container restarts"
        return 0
    else
        print_fail "Some containers have restarted multiple times"
        return 1
    fi
}

# ===========================================
# Log Checks
# ===========================================

check_error_logs() {
    run_check
    print_check "Recent error logs"

    ERROR_COUNT=$(docker compose -f "$COMPOSE_FILE" logs --tail=100 2>&1 | grep -i "error\|exception\|critical" | wc -l)
    THRESHOLD=10

    if [ "$ERROR_COUNT" -lt "$THRESHOLD" ]; then
        print_success "No significant errors in logs ($ERROR_COUNT found)"
        return 0
    else
        print_fail "High error count in logs: $ERROR_COUNT errors"
        print_info "Check logs with: docker-compose -f $COMPOSE_FILE logs"
        return 1
    fi
}

# ===========================================
# Main Verification Process
# ===========================================

print_header "EBKUST University Deployment Verification"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}Base URL: $BASE_URL${NC}"
echo -e "${BLUE}Date: $(date)${NC}"

# Infrastructure Checks
print_header "Infrastructure Checks"
check_docker_running
check_containers_running
check_container_health
check_disk_space
check_memory
check_container_restarts
echo ""

# Service Connectivity Checks
print_header "Service Connectivity Checks"
check_database_connection
check_redis_connection
check_rabbitmq_health
check_celery_worker
echo ""

# Application Health Checks
print_header "Application Health Checks"
check_frontend_health
check_backend_api_health
check_rust_api_health
echo ""

# Security Checks
print_header "Security Checks"
check_ssl_certificate
check_https_redirect
echo ""

# Performance Checks
print_header "Performance Checks"
check_response_time
check_error_logs
echo ""

# ===========================================
# Results Summary
# ===========================================

print_header "Verification Results"

echo -e "${BLUE}Total Checks: $CHECKS_TOTAL${NC}"
echo -e "${GREEN}Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}Failed: $CHECKS_FAILED${NC}"

PASS_RATE=$(( (CHECKS_PASSED * 100) / CHECKS_TOTAL ))
echo -e "${BLUE}Pass Rate: $PASS_RATE%${NC}"

echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}✓ Deployment verification successful!${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo -e "${GREEN}All checks passed. The deployment is healthy.${NC}"
    exit 0
elif [ $PASS_RATE -ge 80 ]; then
    echo -e "${YELLOW}=========================================${NC}"
    echo -e "${YELLOW}⚠ Deployment verification completed with warnings${NC}"
    echo -e "${YELLOW}=========================================${NC}"
    echo ""
    echo -e "${YELLOW}Some checks failed, but the deployment appears functional.${NC}"
    echo -e "${YELLOW}Please review the failed checks and address them.${NC}"
    exit 0
else
    echo -e "${RED}=========================================${NC}"
    echo -e "${RED}✗ Deployment verification failed${NC}"
    echo -e "${RED}=========================================${NC}"
    echo ""
    echo -e "${RED}Critical issues detected. Please review and fix before proceeding.${NC}"
    echo ""
    echo -e "${BLUE}Troubleshooting commands:${NC}"
    echo "  docker compose -f $COMPOSE_FILE ps"
    echo "  docker compose -f $COMPOSE_FILE logs"
    echo "  docker stats"
    exit 1
fi
