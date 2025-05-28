#!/bin/bash

# EverKind Production Deployment Script
# Deploys Next.js app to VM with Caddy SSL

set -e

# Configuration
VM_HOST="sysadmin@everkind-demo.15rock.com"
DOMAIN="everkind-demo.15rock.com"

echo "🚀 Starting EverKind deployment to $VM_HOST"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test connection
print_status "Testing connection to VM..."
if ! ssh -o ConnectTimeout=10 $VM_HOST "echo 'Connection successful'"; then
    print_error "Cannot connect to $VM_HOST"
    exit 1
fi

# Build locally
print_status "Building Next.js application locally..."
cd frontend/web
npm ci
npm run build
cd ../..

# Create deployment package
print_status "Creating deployment package..."
cd frontend/web
tar --no-xattrs -czf ../../everkind-deploy.tar.gz \
    .next \
    package.json \
    package-lock.json \
    next.config.js \
    $([ -d public ] && echo public)
cd ../..

# Upload to VM
print_status "Uploading to VM..."
scp everkind-deploy.tar.gz $VM_HOST:/tmp/

# Deploy on VM
print_status "Setting up application on VM..."
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
    sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update
    sudo apt install -y caddy
fi

# Setup application directory
sudo mkdir -p /var/www/everkind
sudo chown $USER:$USER /var/www/everkind

# Extract application
cd /var/www/everkind
tar -xzf /tmp/everkind-deploy.tar.gz
rm -f /tmp/everkind-deploy.tar.gz

# Install production dependencies with retry logic
echo "Installing dependencies..."
export NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
for i in {1..3}; do
    if npm ci --only=production --no-audit --no-fund --timeout=60000; then
        break
    else
        echo "Attempt $i failed, retrying..."
        npm cache clean --force
        sleep 10
    fi
done

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
    
    header {
        Strict-Transport-Security max-age=31536000;
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
        Referrer-Policy strict-origin-when-cross-origin
    }
    
    encode gzip
    
    @static {
        path /_next/static/*
        path /favicon.ico
        path /*.png /*.jpg /*.jpeg /*.gif /*.svg /*.css /*.js
    }
    header @static Cache-Control max-age=31536000
    
    log {
        output file /var/log/caddy/everkind.log
        format single_field common_log
    }
}
EOF

# Test and restart Caddy
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl restart caddy
sudo systemctl enable caddy

echo "Checking services..."
pm2 status
sudo systemctl status caddy --no-pager -l

ENDSSH

# Clean up
rm -f everkind-deploy.tar.gz

print_status "Deployment completed! 🎉"
print_status ""
print_status "Your EverKind application is available at:"
print_status "🌐 https://$DOMAIN"
print_status ""
print_status "Health check: curl https://$DOMAIN/api/health" 