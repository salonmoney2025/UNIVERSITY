#!/bin/bash

# ===========================================
# EBKUST University Management System
# Production Server Provisioning Script
# ===========================================
#
# This script automatically provisions a fresh Ubuntu server
# for production deployment
#
# Supported OS: Ubuntu 22.04 LTS, Ubuntu 20.04 LTS
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/your-repo/main/scripts/provision-server.sh | bash
#   OR
#   ./scripts/provision-server.sh
#
# ===========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOCKER_COMPOSE_VERSION="2.24.0"
NODE_VERSION="20"
PYTHON_VERSION="3.11"

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

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script must be run as root"
        echo "Please run: sudo $0"
        exit 1
    fi
}

check_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        print_error "Cannot detect OS version"
        exit 1
    fi

    if [ "$OS" != "ubuntu" ]; then
        print_error "This script is designed for Ubuntu only"
        print_info "Detected OS: $OS"
        exit 1
    fi

    print_success "OS detected: Ubuntu $VERSION"
}

# ===========================================
# Installation Functions
# ===========================================

update_system() {
    print_header "Updating System"

    apt-get update
    apt-get upgrade -y
    apt-get dist-upgrade -y
    apt-get autoremove -y
    apt-get autoclean -y

    print_success "System updated"
}

install_essentials() {
    print_header "Installing Essential Packages"

    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        wget \
        gnupg \
        lsb-release \
        software-properties-common \
        git \
        vim \
        nano \
        htop \
        net-tools \
        ufw \
        fail2ban \
        unzip \
        build-essential \
        python3-pip \
        certbot

    print_success "Essential packages installed"
}

install_docker() {
    print_header "Installing Docker"

    # Remove old versions
    apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

    # Install Docker
    curl -fsSL https://get.docker.com | sh

    # Start and enable Docker
    systemctl start docker
    systemctl enable docker

    # Add current user to docker group
    if [ -n "$SUDO_USER" ]; then
        usermod -aG docker "$SUDO_USER"
        print_success "Added $SUDO_USER to docker group"
    fi

    DOCKER_VERSION=$(docker --version)
    print_success "Docker installed: $DOCKER_VERSION"
}

install_docker_compose() {
    print_header "Installing Docker Compose"

    # Docker Compose v2 (plugin)
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
        -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

    # Verify installation
    if docker compose version &> /dev/null; then
        COMPOSE_VERSION=$(docker compose version)
        print_success "Docker Compose installed: $COMPOSE_VERSION"
    else
        print_error "Docker Compose installation failed"
        exit 1
    fi
}

install_nodejs() {
    print_header "Installing Node.js"

    # Install NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -

    # Install Node.js
    apt-get install -y nodejs

    # Verify installation
    NODE_VER=$(node --version)
    NPM_VER=$(npm --version)

    print_success "Node.js installed: $NODE_VER"
    print_success "npm installed: $NPM_VER"
}

install_python() {
    print_header "Installing Python"

    apt-get install -y \
        python${PYTHON_VERSION} \
        python${PYTHON_VERSION}-dev \
        python3-pip \
        python3-venv

    # Update alternatives
    update-alternatives --install /usr/bin/python python /usr/bin/python${PYTHON_VERSION} 1
    update-alternatives --install /usr/bin/python3 python3 /usr/bin/python${PYTHON_VERSION} 1

    PYTHON_VER=$(python3 --version)
    print_success "Python installed: $PYTHON_VER"
}

setup_firewall() {
    print_header "Configuring Firewall (UFW)"

    # Reset UFW
    ufw --force reset

    # Default policies
    ufw default deny incoming
    ufw default allow outgoing

    # Allow SSH
    ufw allow 22/tcp

    # Allow HTTP/HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp

    # Enable UFW
    ufw --force enable

    print_success "Firewall configured"
    ufw status numbered
}

setup_fail2ban() {
    print_header "Configuring Fail2ban"

    # Create jail.local
    cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log

[nginx-badbots]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
EOF

    # Restart fail2ban
    systemctl restart fail2ban
    systemctl enable fail2ban

    print_success "Fail2ban configured"
}

setup_swap() {
    print_header "Setting Up Swap Space"

    # Check if swap already exists
    if swapon --show | grep -q swap; then
        print_info "Swap already configured"
        return
    fi

    SWAP_SIZE="4G"

    # Create swap file
    fallocate -l $SWAP_SIZE /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile

    # Make permanent
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi

    # Configure swappiness
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf

    print_success "Swap space configured: $SWAP_SIZE"
}

optimize_system() {
    print_header "Optimizing System"

    # Increase file limits
    cat >> /etc/security/limits.conf <<EOF

# EBKUST University - Increased limits
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF

    # Optimize kernel parameters
    cat >> /etc/sysctl.conf <<EOF

# EBKUST University - Network optimizations
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_syncookies = 1
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 30
fs.file-max = 2097152
EOF

    sysctl -p

    print_success "System optimized"
}

create_deploy_user() {
    print_header "Creating Deployment User"

    USERNAME="deploy"

    if id "$USERNAME" &>/dev/null; then
        print_info "User $USERNAME already exists"
        return
    fi

    # Create user
    useradd -m -s /bin/bash "$USERNAME"
    usermod -aG docker "$USERNAME"
    usermod -aG sudo "$USERNAME"

    # Set up SSH directory
    mkdir -p /home/$USERNAME/.ssh
    chmod 700 /home/$USERNAME/.ssh
    chown -R $USERNAME:$USERNAME /home/$USERNAME/.ssh

    print_success "Deploy user created: $USERNAME"
    print_info "Add your SSH key to /home/$USERNAME/.ssh/authorized_keys"
}

setup_log_rotation() {
    print_header "Configuring Log Rotation"

    cat > /etc/logrotate.d/docker-containers <<EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
EOF

    print_success "Log rotation configured"
}

install_monitoring_tools() {
    print_header "Installing Monitoring Tools"

    apt-get install -y \
        htop \
        iotop \
        nethogs \
        iftop \
        sysstat \
        dstat

    print_success "Monitoring tools installed"
}

create_directories() {
    print_header "Creating Application Directories"

    mkdir -p /opt/ebkust-university
    mkdir -p /var/log/ebkust-university
    mkdir -p /var/backups/ebkust-university

    if [ -n "$SUDO_USER" ]; then
        chown -R $SUDO_USER:$SUDO_USER /opt/ebkust-university
        chown -R $SUDO_USER:$SUDO_USER /var/log/ebkust-university
    fi

    print_success "Application directories created"
}

# ===========================================
# Main Provisioning Process
# ===========================================

print_header "EBKUST University Server Provisioning"
echo -e "${BLUE}This script will configure a production server${NC}"
echo -e "${BLUE}for the EBKUST University Management System${NC}"
echo ""
echo -e "${YELLOW}This will:${NC}"
echo "  - Update system packages"
echo "  - Install Docker and Docker Compose"
echo "  - Install Node.js and Python"
echo "  - Configure firewall (UFW)"
echo "  - Set up Fail2ban"
echo "  - Create swap space"
echo "  - Optimize system parameters"
echo "  - Create deployment user"
echo "  - Install monitoring tools"
echo ""
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Provisioning cancelled"
    exit 0
fi

# Check prerequisites
check_root
check_os

# Run installation steps
update_system
install_essentials
install_docker
install_docker_compose
install_nodejs
install_python
setup_firewall
setup_fail2ban
setup_swap
optimize_system
create_deploy_user
setup_log_rotation
install_monitoring_tools
create_directories

# ===========================================
# Post-Installation
# ===========================================

print_header "Installation Complete"

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Server provisioning completed successfully!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${BLUE}Installed Components:${NC}"
docker --version
docker compose version
node --version
python3 --version
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Reboot the server: sudo reboot"
echo "  2. Clone the repository:"
echo "     git clone <your-repo-url> /opt/ebkust-university"
echo "  3. Configure environment:"
echo "     cd /opt/ebkust-university"
echo "     cp .env.production.example .env.production"
echo "     nano .env.production"
echo "  4. Setup SSL certificates:"
echo "     sudo certbot certonly --standalone -d yourdomain.com"
echo "  5. Deploy the application:"
echo "     ./scripts/deploy-production.sh --build --migrate"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "  - Firewall is configured (ports: 22, 80, 443)"
echo "  - Fail2ban is active"
echo "  - Swap space: 4GB"
echo "  - Deploy user: 'deploy' (add your SSH key)"
echo ""
echo -e "${BLUE}Server Information:${NC}"
echo "  Hostname: $(hostname)"
echo "  IP Address: $(hostname -I | awk '{print $1}')"
echo "  OS: $(lsb_release -d | cut -f2)"
echo "  Kernel: $(uname -r)"
echo ""

print_info "Server will need to be rebooted for all changes to take effect"
read -p "Reboot now? (yes/no): " REBOOT

if [ "$REBOOT" = "yes" ]; then
    print_info "Rebooting in 5 seconds..."
    sleep 5
    reboot
else
    print_info "Please reboot manually: sudo reboot"
fi

exit 0
