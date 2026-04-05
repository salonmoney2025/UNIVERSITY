#!/bin/bash

# ===========================================
# EBKUST University Management System
# Database Backup Script
# ===========================================
#
# This script creates automated backups of the PostgreSQL database
#
# Usage:
#   ./scripts/backup-database.sh [production|development]
#
# Setup for automatic daily backups:
#   sudo crontab -e
#   Add: 0 2 * * * /path/to/scripts/backup-database.sh production
#
# ===========================================

set -e

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_DIR="backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Set compose file based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    DB_NAME="university_lms"
else
    COMPOSE_FILE="docker-compose.yml"
    DB_NAME="university_lms"
fi

FILENAME="university_lms_${ENVIRONMENT}_${DATE}.sql"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================="
echo "EBKUST University Database Backup"
echo "Environment: $ENVIRONMENT"
echo "Date: $(date)"
echo "========================================="
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if database is running
if ! docker-compose -f "$COMPOSE_FILE" ps | grep postgres | grep -q Up; then
    echo -e "${RED}✗ PostgreSQL is not running${NC}"
    exit 1
fi

echo -e "${YELLOW}Creating backup...${NC}"

# Create backup
if docker-compose -f "$COMPOSE_FILE" exec -T postgres \
    pg_dump -U postgres "$DB_NAME" > "$BACKUP_DIR/$FILENAME"; then

    # Compress backup
    gzip "$BACKUP_DIR/$FILENAME"

    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$FILENAME.gz" | cut -f1)

    echo -e "${GREEN}✓ Backup created successfully${NC}"
    echo -e "  File: $BACKUP_DIR/$FILENAME.gz"
    echo -e "  Size: $BACKUP_SIZE"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

# Remove old backups
echo -e "${YELLOW}Cleaning old backups (older than $RETENTION_DAYS days)...${NC}"
DELETED_COUNT=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo -e "${GREEN}✓ Deleted $DELETED_COUNT old backup(s)${NC}"

# List recent backups
echo ""
echo "Recent backups:"
ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -5

# Calculate total backup size
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo ""
echo -e "Total backup size: ${GREEN}$TOTAL_SIZE${NC}"

echo ""
echo "========================================="
echo "Backup Complete"
echo "========================================="

exit 0
