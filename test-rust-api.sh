#!/bin/bash

# Test script for Rust API v2 endpoints
# Compares Rust API responses with Django API responses

echo "========================================"
echo "Rust API v2 Testing Suite"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API URLs
DJANGO_API="http://localhost:8000/api/v1"
RUST_API="http://localhost:8081/api/v2"
NGINX_V1="http://localhost/api/v1"
NGINX_V2="http://localhost/api/v2"

# Test counters
PASSED=0
FAILED=0

test_endpoint() {
    local name=$1
    local endpoint=$2
    local expected_status=$3

    echo -n "Testing $name... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint" 2>/dev/null)

    if [ "$response" == "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected $expected_status, got $response)"
        ((FAILED++))
    fi
}

test_json_response() {
    local name=$1
    local endpoint=$2

    echo -n "Testing $name... "

    response=$(curl -s "$endpoint" 2>/dev/null)

    if echo "$response" | jq -e . >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PASSED${NC} (Valid JSON)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Invalid JSON)"
        ((FAILED++))
        return 1
    fi
}

echo "========================================"
echo "1. Health Checks"
echo "========================================"
test_endpoint "Rust API Health" "$RUST_API/../health" "200"
test_endpoint "Nginx Health" "http://localhost/health" "200"
echo ""

echo "========================================"
echo "2. Students Endpoints (Rust API Direct)"
echo "========================================"
test_endpoint "GET /api/v2/students" "$RUST_API/students" "200"
test_json_response "Students JSON Format" "$RUST_API/students"
echo ""

echo "========================================"
echo "3. Courses Endpoints (Rust API Direct)"
echo "========================================"
test_endpoint "GET /api/v2/courses" "$RUST_API/courses" "200"
test_json_response "Courses JSON Format" "$RUST_API/courses"
test_endpoint "GET /api/v2/courses/programs" "$RUST_API/courses/programs" "200"
echo ""

echo "========================================"
echo "4. Exams Endpoints (Rust API Direct)"
echo "========================================"
test_endpoint "GET /api/v2/exams" "$RUST_API/exams" "200"
test_json_response "Exams JSON Format" "$RUST_API/exams"
echo ""

echo "========================================"
echo "5. Nginx Routing (v1 → Django, v2 → Rust)"
echo "========================================"
test_endpoint "Django via Nginx (v1)" "$NGINX_V1/students/" "200"
test_endpoint "Rust via Nginx (v2)" "$NGINX_V2/students" "200"
echo ""

echo "========================================"
echo "6. Pagination Tests"
echo "========================================"
test_endpoint "Pagination page=1" "$RUST_API/students?page=1&page_size=5" "200"
test_endpoint "Pagination page=2" "$RUST_API/students?page=2&page_size=5" "200"
echo ""

echo "========================================"
echo "7. Error Handling"
echo "========================================"
test_endpoint "404 Not Found" "$RUST_API/students/00000000-0000-0000-0000-000000000000" "404"
test_endpoint "Invalid UUID" "$RUST_API/students/invalid-uuid" "400"
echo ""

echo "========================================"
echo "Summary"
echo "========================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
else
    echo -e "Failed: $FAILED"
fi
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
