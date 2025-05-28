# EverKind Deployment Guide

This guide explains how to deploy the EverKind chat application to a VM with SSL using Caddy.

## Prerequisites

1. **SSH Access**: Ensure you have SSH access to `sysadmin@everkind-demo.15rock.com`
2. **Domain Setup**: The domain `everkind-demo.15rock.com` should point to your VM's IP address
3. **VM Requirements**: Ubuntu/Debian-based system with sudo access

## Quick Deployment

Run the automated deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
- ✅ Build the Next.js application
- ✅ Upload files to the VM
- ✅ Install Node.js, PM2, and Caddy
- ✅ Configure SSL with Let's Encrypt
- ✅ Start the application with PM2
- ✅ Set up reverse proxy with Caddy

## Manual Deployment Steps

If you prefer to deploy manually:

### 1. Build the Application

```bash
cd frontend/web
npm ci
npm run build
```

### 2. Upload to VM

```bash
# Create deployment package
tar -czf everkind-deploy.tar.gz \
    frontend/web/.next \
    frontend/web/public \
    frontend/web/package.json \
    frontend/web/package-lock.json \
    frontend/web/next.config.js

# Upload to VM
scp everkind-deploy.tar.gz sysadmin@everkind-demo.15rock.com:/tmp/
```

### 3. Setup on VM

SSH into the VM and run:

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy

# Setup application
sudo mkdir -p /var/www/everkind
sudo chown $USER:$USER /var/www/everkind
cd /var/www/everkind
tar -xzf /tmp/everkind-deploy.tar.gz --strip-components=2
npm ci --only=production
```

### 4. Configure PM2

Create `ecosystem.config.js`:

```javascript
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
```

Start the application:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Configure Caddy

Create `/etc/caddy/Caddyfile`:

```
everkind-demo.15rock.com {
    reverse_proxy localhost:3000
    
    # Security headers
    header {
        Strict-Transport-Security max-age=31536000;
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
        Referrer-Policy strict-origin-when-cross-origin
    }
    
    # Gzip compression
    encode gzip
    
    # Cache static assets
    @static {
        path /_next/static/*
        path /favicon.ico
        path /*.png /*.jpg /*.jpeg /*.gif /*.svg /*.css /*.js
    }
    header @static Cache-Control max-age=31536000
    
    # Logs
    log {
        output file /var/log/caddy/everkind.log
        format single_field common_log
    }
}
```

Start Caddy:

```bash
sudo systemctl restart caddy
sudo systemctl enable caddy
```

## Post-Deployment

### Access Your Application

🌐 **Your app will be available at:** https://everkind-demo.15rock.com

### Health Check

Test the health endpoint:
```bash
curl https://everkind-demo.15rock.com/api/health
```

### Management Commands

```bash
# Check application status
ssh sysadmin@everkind-demo.15rock.com 'pm2 status'

# View application logs
ssh sysadmin@everkind-demo.15rock.com 'pm2 logs everkind'

# Restart application
ssh sysadmin@everkind-demo.15rock.com 'pm2 restart everkind'

# Check Caddy status
ssh sysadmin@everkind-demo.15rock.com 'sudo systemctl status caddy'

# View Caddy logs
ssh sysadmin@everkind-demo.15rock.com 'sudo journalctl -u caddy -f'
```

## SSL Certificate

Caddy will automatically obtain and renew SSL certificates from Let's Encrypt. The certificate will be valid for `everkind-demo.15rock.com`.

## Troubleshooting

### Common Issues

1. **Connection refused**: Check if PM2 is running the app on port 3000
2. **SSL issues**: Ensure domain points to correct IP and port 443 is open
3. **Build failures**: Check Node.js version (should be 18+)

### Logs

- **Application logs**: `pm2 logs everkind`
- **Caddy logs**: `sudo journalctl -u caddy`
- **System logs**: `sudo journalctl -xe`

### Firewall

Ensure these ports are open:
- **80** (HTTP - for Let's Encrypt)
- **443** (HTTPS)
- **22** (SSH)

## Architecture

```
Internet → Caddy (SSL/443) → Next.js App (3000) → PM2 Process Manager
```

## Security Features

- ✅ **SSL/TLS encryption** via Let's Encrypt
- ✅ **Security headers** (HSTS, XSS protection, etc.)
- ✅ **Gzip compression**
- ✅ **Static asset caching**
- ✅ **Process management** with PM2
- ✅ **Automatic restarts** on failure

## Updates

To update the application:

1. Make changes locally
2. Run `./deploy.sh` again
3. The script will rebuild and redeploy automatically

---

**Need help?** Check the logs or contact the development team. 