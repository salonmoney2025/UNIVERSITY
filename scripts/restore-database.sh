#!/bin/bash

# ===========================================
# EBKUST University Management System
# Database Restore Script
# ===========================================
#
# This script restores the PostgreSQL database from a backup
#
# Usage:
#   ./scripts/restore-database.sh <backup-file> [production|development]
#
# Example:
#   ./scripts/restore-database.sh backups/database/university_lms_production_20240402_020000.sql.gz production
#
# ===========================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check arguments
if [ -z "$1" ]; then
    echo -e "${RED}Error: Backup file not specified${NC}"
    echo ""
    echo "Usage: ./scripts/restore-database.sh <backup-file> [production|development]"
    echo ""
    echo "Available backups:"
    ls -lh backups/database/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"
ENVIRONMENT=${2:-production}

# Set compose file based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    DB_NAME="university_lms"
else
    COMPOSE_FILE="docker-compose.yml"
    DB_NAME="university_lms"
fi

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}✗ Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

echo "========================================="
echo "EBKUST University Database Restore"
echo "========================================="
echo -e "Environment: ${BLUE}$ENVIRONMENT${NC}"
echo -e "Backup file: ${BLUE}$BACKUP_FILE${NC}"
echo -e "Date: ${BLUE}$(date)${NC}"
echo "========================================="
echo ""

# Confirm restore
echo -e "${YELLOW}⚠️  WARNING: This will REPLACE the current database!${NC}"
echo -e "${YELLOW}⚠️  All existing data will be lost!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}Restore cancelled${NC}"
    exit 0
fi

# Create a backup of current database before restore
echo ""
echo -e "${YELLOW}Creating safety backup of current database...${NC}"
SAFETY_BACKUP="backups/database/pre_restore_$(date +%Y%m%d_%H%M%S).sql"
mkdir -p backups/database

if docker-compose -f "$COMPOSE_FILE" exec -T postgres \
    pg_dump -U postgres "$DB_NAME" > "$SAFETY_BACKUP"; then
    gzip "$SAFETY_BACKUP"
    echo -e "${GREEN}✓ Safety backup created: $SAFETY_BACKUP.gz${NC}"
else
    echo -e "${RED}✗ Failed to create safety backup${NC}"
    read -p "Continue anyway? (yes/no): " CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        exit 1
    fi
fi

# Decompress backup if needed
RESTORE_FILE="$BACKUP_FILE"
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${YELLOW}Decompressing backup...${NC}"
    RESTORE_FILE="${BACKUP_FILE%.gz}"
    gunzip -k "$BACKUP_FILE"
fi

# Stop services that use the database
echo -e "${YELLOW}Stopping services...${NC}"
docker-compose -f "$COMPOSE_FILE" stop backend celery_worker celery_beat rust-api

# Drop and recreate database
echo -e "${YELLOW}Dropping existing database...${NC}"
docker-compose -f "$COMPOSE_FILE" exec -T postgres \
    psql -U postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"

echo -e "${YELLOW}Creating new database...${NC}"
docker-compose -f "$COMPOSE_FILE" exec -T postgres \
    psql -U postgres -c "CREATE DATABASE $DB_NAME;"

# Restore database
echo -e "${YELLOW}Restoring database...${NC}"
if cat "$RESTORE_FILE" | docker-compose -f "$COMPOSE_FILE" exec -T postgres \
    psql -U postgres "$DB_NAME"; then
    echo -e "${GREEN}✓ Database restored successfully${NC}"
else
    echo -e "${RED}✗ Database restore failed${NC}"

    # Try to restore from safety backup
    echo -e "${YELLOW}Attempting to restore from safety backup...${NC}"
    gunzip -k "$SAFETY_BACKUP.gz" 2>/dev/null || true
    cat "${SAFETY_BACKUP%.gz}" | docker-compose -f "$COMPOSE_FILE" exec -T postgres \
        psql -U postgres "$DB_NAME" || true

    exit 1
fi

# Clean up decompressed file if it was compressed
if [[ "$BACKUP_FILE" == *.gz ]] && [ -f "$RESTORE_FILE" ]; then
    rm "$RESTORE_FILE"
fi

# Restart services
echo -e "${YELLOW}Restarting services...${NC}"
docker-compose -f "$COMPOSE_FILE" start backend celery_worker celery_beat rust-api

echo ""
echo "========================================="
echo -e "${GREEN}Database Restore Complete${NC}"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Verify data integrity"
echo "  2. Test application functionality"
echo "  3. Check logs: docker-compose -f $COMPOSE_FILE logs -f"
echo ""

exit 0
