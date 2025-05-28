#!/bin/bash

# EverKind Deployment Script
# Deploys Next.js app to VM with Caddy SSL

set -e

# Configuration
VM_HOST="sysadmin@everkind-demo.15rock.com"
DOMAIN="everkind-demo.15rock.com"
APP_DIR="/var/www/everkind"
SERVICE_NAME="everkind"

echo "🚀 Starting EverKind deployment to $VM_HOST"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we can connect to the VM
print_status "Testing connection to VM..."
if ! ssh -o ConnectTimeout=10 $VM_HOST "echo 'Connection successful'"; then
    print_error "Cannot connect to $VM_HOST"
    print_error "Please ensure:"
    print_error "1. SSH key is set up"
    print_error "2. VM is running"
    print_error "3. Network connectivity is available"
    exit 1
fi

# Build the Next.js application
print_status "Building Next.js application..."
cd frontend/web
npm ci
npm run build
cd ../..

# Create deployment package
print_status "Creating deployment package..."
tar -czf everkind-deploy.tar.gz \
    frontend/web/.next \
    frontend/web/public \
    frontend/web/package.json \
    frontend/web/package-lock.json \
    frontend/web/next.config.js \
    --exclude=node_modules

# Upload files to VM
print_status "Uploading files to VM..."
scp everkind-deploy.tar.gz $VM_HOST:/tmp/

# Deploy on VM
print_status "Deploying on VM..."
ssh $VM_HOST << 'ENDSSH'
set -e

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Install Caddy if not present
if ! command -v caddy &> /dev/null; then
    echo "Installing Caddy..."
    sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update
    sudo apt install -y caddy
fi

# Create app directory
sudo mkdir -p /var/www/everkind
sudo chown $USER:$USER /var/www/everkind

# Extract application
cd /var/www/everkind
tar -xzf /tmp/everkind-deploy.tar.gz --strip-components=2
rm -f /tmp/everkind-deploy.tar.gz

# Install dependencies
npm ci --only=production

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'everkind',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/everkind',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Stop existing PM2 process if running
pm2 delete everkind 2>/dev/null || true

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup | grep -E '^sudo' | bash || true

ENDSSH

# Configure Caddy
print_status "Configuring Caddy for SSL..."
ssh $VM_HOST << ENDSSH
# Create Caddyfile
sudo tee /etc/caddy/Caddyfile > /dev/null << 'EOF'
$DOMAIN {
    reverse_proxy localhost:3000
    
    # Security headers
    header {
        # Enable HSTS
        Strict-Transport-Security max-age=31536000;
        # Prevent MIME type sniffing
        X-Content-Type-Options nosniff
        # Prevent clickjacking
        X-Frame-Options DENY
        # XSS protection
        X-XSS-Protection "1; mode=block"
        # Referrer policy
        Referrer-Policy strict-origin-when-cross-origin
    }
    
    # Gzip compression
    encode gzip
    
    # Cache static assets
    @static {
        path /_next/static/*
        path /favicon.ico
        path /*.png
        path /*.jpg
        path /*.jpeg
        path /*.gif
        path /*.svg
        path /*.css
        path /*.js
    }
    header @static Cache-Control max-age=31536000
    
    # Logs
    log {
        output file /var/log/caddy/everkind.log
        format single_field common_log
    }
}
EOF

# Test Caddy configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Restart Caddy
sudo systemctl restart caddy
sudo systemctl enable caddy

# Check if Caddy is running
sudo systemctl status caddy --no-pager
ENDSSH

# Clean up local files
rm -f everkind-deploy.tar.gz

print_status "Deployment completed successfully! 🎉"
print_status ""
print_status "Your EverKind application is now available at:"
print_status "🌐 https://$DOMAIN"
print_status ""
print_status "Useful commands for managing the deployment:"
print_status "• Check app status: ssh $VM_HOST 'pm2 status'"
print_status "• View app logs: ssh $VM_HOST 'pm2 logs everkind'"
print_status "• Restart app: ssh $VM_HOST 'pm2 restart everkind'"
print_status "• Check Caddy status: ssh $VM_HOST 'sudo systemctl status caddy'"
print_status "• View Caddy logs: ssh $VM_HOST 'sudo journalctl -u caddy -f'"
print_status ""
print_status "SSL certificate will be automatically obtained from Let's Encrypt!" 