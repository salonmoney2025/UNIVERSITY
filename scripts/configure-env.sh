#!/bin/bash

# ===========================================
# EBKUST University Management System
# Environment Configuration Helper
# ===========================================
#
# This script helps configure environment variables
# and validates the configuration
#
# Usage:
#   ./scripts/configure-env.sh [development|production]
#
# ===========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
ENVIRONMENT=${1:-production}

if [ "$ENVIRONMENT" = "production" ]; then
    ENV_FILE=".env.production"
    EXAMPLE_FILE=".env.production.example"
else
    ENV_FILE=".env"
    EXAMPLE_FILE=".env.example"
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
    echo -e "${CYAN}ℹ $1${NC}"
}

generate_secret() {
    local LENGTH=${1:-32}
    python3 -c "import secrets; print(secrets.token_urlsafe($LENGTH))"
}

generate_hex() {
    local LENGTH=${1:-32}
    openssl rand -hex $LENGTH
}

generate_base64() {
    local LENGTH=${1:-32}
    openssl rand -base64 $LENGTH
}

prompt_input() {
    local PROMPT=$1
    local DEFAULT=$2
    local SECRET=${3:-false}

    if [ "$SECRET" = "true" ]; then
        read -sp "$PROMPT [$DEFAULT]: " VALUE
        echo ""
    else
        read -p "$PROMPT [$DEFAULT]: " VALUE
    fi

    echo "${VALUE:-$DEFAULT}"
}

# ===========================================
# Validation Functions
# ===========================================

validate_email() {
    local EMAIL=$1
    if [[ "$EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

validate_domain() {
    local DOMAIN=$1
    if [[ "$DOMAIN" =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

validate_port() {
    local PORT=$1
    if [[ "$PORT" =~ ^[0-9]+$ ]] && [ "$PORT" -ge 1 ] && [ "$PORT" -le 65535 ]; then
        return 0
    else
        return 1
    fi
}

# ===========================================
# Configuration Functions
# ===========================================

check_existing_file() {
    if [ -f "$ENV_FILE" ]; then
        print_warning "File $ENV_FILE already exists"
        read -p "Do you want to overwrite it? (yes/no): " OVERWRITE
        if [ "$OVERWRITE" != "yes" ]; then
            echo "Keeping existing file. Use a different name or backup your file."
            exit 0
        fi
        mv "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        print_info "Existing file backed up"
    fi
}

copy_example_file() {
    if [ ! -f "$EXAMPLE_FILE" ]; then
        print_error "Example file not found: $EXAMPLE_FILE"
        exit 1
    fi

    cp "$EXAMPLE_FILE" "$ENV_FILE"
    print_success "Created $ENV_FILE from template"
}

configure_secrets() {
    print_header "Configuring Security Secrets"

    # Django SECRET_KEY
    echo -e "${CYAN}Generating Django SECRET_KEY...${NC}"
    SECRET_KEY=$(generate_secret 50)
    sed -i.bak "s|SECRET_KEY=.*|SECRET_KEY=$SECRET_KEY|" "$ENV_FILE"
    print_success "Django SECRET_KEY generated"

    # JWT Secret
    echo -e "${CYAN}Generating JWT_SECRET...${NC}"
    JWT_SECRET=$(generate_base64 32)
    sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" "$ENV_FILE"
    print_success "JWT_SECRET generated"

    # PostgreSQL Password
    echo -e "${CYAN}Generating PostgreSQL password...${NC}"
    POSTGRES_PASSWORD=$(generate_base64 24)
    sed -i.bak "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$POSTGRES_PASSWORD|" "$ENV_FILE"
    print_success "PostgreSQL password generated"

    # RabbitMQ Credentials
    echo -e "${CYAN}Generating RabbitMQ credentials...${NC}"
    RABBITMQ_USER="admin"
    RABBITMQ_PASS=$(generate_base64 24)
    sed -i.bak "s|RABBITMQ_USER=.*|RABBITMQ_USER=$RABBITMQ_USER|" "$ENV_FILE"
    sed -i.bak "s|RABBITMQ_PASS=.*|RABBITMQ_PASS=$RABBITMQ_PASS|" "$ENV_FILE"
    print_success "RabbitMQ credentials generated"

    rm -f "${ENV_FILE}.bak"
}

configure_domain() {
    print_header "Configuring Domain Settings"

    read -p "Enter your domain name (e.g., ebkustsl.edu.sl): " DOMAIN

    if ! validate_domain "$DOMAIN"; then
        print_warning "Invalid domain format. Using example.com"
        DOMAIN="example.com"
    fi

    # Update domain in env file
    sed -i.bak "s|yourdomain.com|$DOMAIN|g" "$ENV_FILE"
    sed -i.bak "s|ALLOWED_HOSTS=.*|ALLOWED_HOSTS=$DOMAIN,www.$DOMAIN|" "$ENV_FILE"
    sed -i.bak "s|CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN|" "$ENV_FILE"

    print_success "Domain configured: $DOMAIN"

    rm -f "${ENV_FILE}.bak"
}

configure_email() {
    print_header "Configuring Email Settings"

    echo -e "${CYAN}Email Provider Options:${NC}"
    echo "  1. Gmail"
    echo "  2. SendGrid"
    echo "  3. AWS SES"
    echo "  4. Custom SMTP"
    read -p "Select option [1]: " EMAIL_OPTION
    EMAIL_OPTION=${EMAIL_OPTION:-1}

    case $EMAIL_OPTION in
        1)
            EMAIL_HOST="smtp.gmail.com"
            EMAIL_PORT="587"
            EMAIL_USE_TLS="true"
            ;;
        2)
            EMAIL_HOST="smtp.sendgrid.net"
            EMAIL_PORT="587"
            EMAIL_USE_TLS="true"
            ;;
        3)
            EMAIL_HOST="email-smtp.us-east-1.amazonaws.com"
            EMAIL_PORT="587"
            EMAIL_USE_TLS="true"
            ;;
        4)
            read -p "SMTP Host: " EMAIL_HOST
            read -p "SMTP Port [587]: " EMAIL_PORT
            EMAIL_PORT=${EMAIL_PORT:-587}
            read -p "Use TLS? (true/false) [true]: " EMAIL_USE_TLS
            EMAIL_USE_TLS=${EMAIL_USE_TLS:-true}
            ;;
    esac

    read -p "Email address: " EMAIL_USER
    if ! validate_email "$EMAIL_USER"; then
        print_warning "Invalid email format"
    fi

    read -sp "Email password/API key: " EMAIL_PASSWORD
    echo ""

    # Update email settings
    sed -i.bak "s|EMAIL_HOST=.*|EMAIL_HOST=$EMAIL_HOST|" "$ENV_FILE"
    sed -i.bak "s|EMAIL_PORT=.*|EMAIL_PORT=$EMAIL_PORT|" "$ENV_FILE"
    sed -i.bak "s|EMAIL_USE_TLS=.*|EMAIL_USE_TLS=$EMAIL_USE_TLS|" "$ENV_FILE"
    sed -i.bak "s|EMAIL_HOST_USER=.*|EMAIL_HOST_USER=$EMAIL_USER|" "$ENV_FILE"
    sed -i.bak "s|EMAIL_HOST_PASSWORD=.*|EMAIL_HOST_PASSWORD=$EMAIL_PASSWORD|" "$ENV_FILE"

    print_success "Email settings configured"

    rm -f "${ENV_FILE}.bak"
}

configure_database() {
    print_header "Configuring Database Settings"

    read -p "Database name [university_lms]: " DB_NAME
    DB_NAME=${DB_NAME:-university_lms}

    read -p "Database user [postgres]: " DB_USER
    DB_USER=${DB_USER:-postgres}

    # Update database settings
    sed -i.bak "s|POSTGRES_DB=.*|POSTGRES_DB=$DB_NAME|" "$ENV_FILE"
    sed -i.bak "s|POSTGRES_USER=.*|POSTGRES_USER=$DB_USER|" "$ENV_FILE"

    print_success "Database settings configured"

    rm -f "${ENV_FILE}.bak"
}

configure_payment_gateway() {
    print_header "Configuring Payment Gateway"

    echo -e "${CYAN}Payment Gateway Options:${NC}"
    echo "  1. Flutterwave"
    echo "  2. PayStack"
    echo "  3. Both"
    echo "  4. Skip"
    read -p "Select option [1]: " PAYMENT_OPTION
    PAYMENT_OPTION=${PAYMENT_OPTION:-1}

    if [ "$PAYMENT_OPTION" = "4" ]; then
        print_info "Skipping payment gateway configuration"
        return
    fi

    if [ "$PAYMENT_OPTION" = "1" ] || [ "$PAYMENT_OPTION" = "3" ]; then
        echo ""
        echo -e "${CYAN}Flutterwave Configuration:${NC}"
        read -p "Flutterwave Public Key: " FLW_PUBLIC
        read -sp "Flutterwave Secret Key: " FLW_SECRET
        echo ""
        read -sp "Flutterwave Encryption Key: " FLW_ENCRYPTION
        echo ""

        sed -i.bak "s|FLUTTERWAVE_PUBLIC_KEY=.*|FLUTTERWAVE_PUBLIC_KEY=$FLW_PUBLIC|" "$ENV_FILE"
        sed -i.bak "s|FLUTTERWAVE_SECRET_KEY=.*|FLUTTERWAVE_SECRET_KEY=$FLW_SECRET|" "$ENV_FILE"
        sed -i.bak "s|FLUTTERWAVE_ENCRYPTION_KEY=.*|FLUTTERWAVE_ENCRYPTION_KEY=$FLW_ENCRYPTION|" "$ENV_FILE"

        print_success "Flutterwave configured"
    fi

    if [ "$PAYMENT_OPTION" = "2" ] || [ "$PAYMENT_OPTION" = "3" ]; then
        echo ""
        echo -e "${CYAN}PayStack Configuration:${NC}"
        read -p "PayStack Public Key: " PS_PUBLIC
        read -sp "PayStack Secret Key: " PS_SECRET
        echo ""

        sed -i.bak "s|PAYSTACK_PUBLIC_KEY=.*|PAYSTACK_PUBLIC_KEY=$PS_PUBLIC|" "$ENV_FILE"
        sed -i.bak "s|PAYSTACK_SECRET_KEY=.*|PAYSTACK_SECRET_KEY=$PS_SECRET|" "$ENV_FILE"

        print_success "PayStack configured"
    fi

    rm -f "${ENV_FILE}.bak"
}

validate_configuration() {
    print_header "Validating Configuration"

    VALIDATION_ERRORS=0

    # Check SECRET_KEY
    if grep -q "CHANGE_THIS_TO_A_STRONG_SECRET_KEY" "$ENV_FILE"; then
        print_error "SECRET_KEY not configured"
        ((VALIDATION_ERRORS++))
    else
        print_success "SECRET_KEY configured"
    fi

    # Check JWT_SECRET
    if grep -q "CHANGE_THIS_TO_A_STRONG_JWT_SECRET" "$ENV_FILE"; then
        print_error "JWT_SECRET not configured"
        ((VALIDATION_ERRORS++))
    else
        print_success "JWT_SECRET configured"
    fi

    # Check POSTGRES_PASSWORD
    if grep -q "CHANGE_THIS_TO_STRONG_PASSWORD" "$ENV_FILE"; then
        print_error "POSTGRES_PASSWORD not configured"
        ((VALIDATION_ERRORS++))
    else
        print_success "POSTGRES_PASSWORD configured"
    fi

    # Check domain
    if grep -q "yourdomain.com" "$ENV_FILE"; then
        print_warning "Domain not configured (using default)"
    else
        print_success "Domain configured"
    fi

    if [ $VALIDATION_ERRORS -eq 0 ]; then
        print_success "All critical settings configured"
        return 0
    else
        print_error "$VALIDATION_ERRORS critical setting(s) not configured"
        return 1
    fi
}

show_summary() {
    print_header "Configuration Summary"

    echo -e "${CYAN}Environment File: ${GREEN}$ENV_FILE${NC}"
    echo ""
    echo -e "${CYAN}Generated Secrets:${NC}"
    echo -e "  ${GREEN}✓${NC} Django SECRET_KEY"
    echo -e "  ${GREEN}✓${NC} JWT_SECRET"
    echo -e "  ${GREEN}✓${NC} PostgreSQL Password"
    echo -e "  ${GREEN}✓${NC} RabbitMQ Credentials"
    echo ""
    echo -e "${CYAN}Configured Settings:${NC}"

    if grep -q "yourdomain.com" "$ENV_FILE"; then
        echo -e "  ${YELLOW}⚠${NC} Domain (default)"
    else
        DOMAIN=$(grep "^ALLOWED_HOSTS=" "$ENV_FILE" | cut -d'=' -f2 | cut -d',' -f1)
        echo -e "  ${GREEN}✓${NC} Domain: $DOMAIN"
    fi

    if grep -q "your-email@" "$ENV_FILE"; then
        echo -e "  ${YELLOW}⚠${NC} Email (not configured)"
    else
        EMAIL=$(grep "^EMAIL_HOST_USER=" "$ENV_FILE" | cut -d'=' -f2)
        echo -e "  ${GREEN}✓${NC} Email: $EMAIL"
    fi

    DB_NAME=$(grep "^POSTGRES_DB=" "$ENV_FILE" | cut -d'=' -f2)
    echo -e "  ${GREEN}✓${NC} Database: $DB_NAME"

    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Review $ENV_FILE and adjust settings as needed"
    echo "  2. Ensure SSL certificates are in place (production)"
    echo "  3. Deploy with: ./scripts/deploy-${ENVIRONMENT}.sh"
    echo ""
    echo -e "${YELLOW}Important:${NC}"
    echo "  - Never commit $ENV_FILE to version control"
    echo "  - Keep backups in a secure location"
    echo "  - Rotate secrets regularly"
}

# ===========================================
# Main Configuration Process
# ===========================================

print_header "EBKUST University Environment Configuration"
echo -e "${BLUE}Environment: $ENVIRONMENT${NC}"
echo -e "${BLUE}Target file: $ENV_FILE${NC}"
echo ""

# Interactive mode
echo -e "${CYAN}Configuration Modes:${NC}"
echo "  1. Quick Setup (auto-generate secrets only)"
echo "  2. Interactive Setup (guided configuration)"
echo "  3. Manual Setup (create file only)"
read -p "Select mode [1]: " CONFIG_MODE
CONFIG_MODE=${CONFIG_MODE:-1}

case $CONFIG_MODE in
    1)
        # Quick setup
        print_info "Running quick setup..."
        check_existing_file
        copy_example_file
        configure_secrets
        validate_configuration
        ;;
    2)
        # Interactive setup
        print_info "Running interactive setup..."
        check_existing_file
        copy_example_file
        configure_secrets
        configure_domain
        configure_database
        configure_email
        configure_payment_gateway
        validate_configuration
        ;;
    3)
        # Manual setup
        print_info "Creating environment file for manual configuration..."
        check_existing_file
        copy_example_file
        print_info "Please edit $ENV_FILE manually"
        ;;
    *)
        print_error "Invalid option"
        exit 1
        ;;
esac

show_summary

print_header "Configuration Complete"
echo -e "${GREEN}Environment file created: $ENV_FILE${NC}"
echo ""

exit 0
