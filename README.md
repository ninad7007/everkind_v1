# EverKind - AI Therapeutic Voice Assistant

A comprehensive AI-powered therapeutic chat application designed to provide accessible mental health support through evidence-based Cognitive Behavioral Therapy (CBT) techniques.

## 🌟 Overview

EverKind is a modern therapeutic platform that combines:
- **Real-time voice interactions** with <700ms latency
- **Evidence-based CBT techniques** for depression and anxiety
- **HIPAA-compliant architecture** for healthcare data
- **Crisis management protocols** for user safety
- **Beautiful, accessible UI** designed for therapeutic use

## 🚀 Live Demo

**Production URL**: https://everkind-demo.15rock.com

The application is currently deployed and accessible with:
- ✅ SSL/TLS encryption via Let's Encrypt
- ✅ Production-optimized Next.js build
- ✅ PM2 process management
- ✅ Caddy reverse proxy with security headers
- ✅ Health monitoring at `/api/health`

## 🏗️ Architecture

```
Internet → Caddy (SSL/443) → Next.js App (3000) → PM2 Process Manager
```

### Technology Stack

**Frontend**:
- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS + shadcn/ui
- Therapeutic design system

**Backend** (Planned):
- FastAPI with Python
- PostgreSQL database
- Redis for caching
- WebSocket for real-time voice

**AI/ML**:
- OpenAI Whisper (Speech-to-Text)
- ElevenLabs (Text-to-Speech)
- GPT-4 Turbo + Llama 3.2 3B

**Infrastructure**:
- VM deployment with Caddy
- PM2 process management
- Let's Encrypt SSL certificates
- HIPAA-compliant hosting

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- SSH access to deployment VM (for contributors)

### Local Development

1. **Clone the repository**:
```bash
git clone https://github.com/ninad7007/everkind_v1.git
cd everkind_v1
```

2. **Install frontend dependencies**:
```bash
cd frontend/web
npm install
```

3. **Start development server**:
```bash
npm run dev
```

4. **Open in browser**: http://localhost:3000

### Project Structure

```
everkind_v1/
├── frontend/web/           # Next.js frontend application
│   ├── app/               # Next.js App Router pages
│   ├── components/        # React components
│   ├── lib/              # Utility functions
│   └── public/           # Static assets
├── deploy.sh             # Production deployment script
├── DEPLOYMENT.md         # Detailed deployment guide
├── PLANNING.md           # Project architecture & roadmap
├── TASKS.md             # Development task tracking
└── README.md            # This file
```

## 🚀 Deployment

### Quick Deployment

For users with VM access:

```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy to production
./deploy.sh
```

The deployment script will:
- ✅ Build the Next.js application locally
- ✅ Upload files to the VM via SCP
- ✅ Install Node.js, PM2, and Caddy (if needed)
- ✅ Configure SSL with Let's Encrypt
- ✅ Start the application with PM2
- ✅ Set up reverse proxy with security headers

### Manual Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed manual deployment instructions.

### VM Requirements

- Ubuntu/Debian-based system
- SSH access with public key authentication
- Sudo privileges
- Ports 80, 443, and 22 open
- Domain pointing to VM IP address

## 🤝 Contributing

### For Team Members with VM Access

1. **Get VM Access**:
   - Request SSH key access to `sysadmin@everkind-demo.15rock.com`
   - Ensure your public key is added to the VM

2. **Development Workflow**:
```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make your changes
# Edit files in frontend/web/ or other directories

# 3. Test locally
cd frontend/web
npm run dev

# 4. Deploy to staging/production
./deploy.sh

# 5. Test deployment
curl https://everkind-demo.15rock.com/api/health

# 6. Commit and push
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name

# 7. Create pull request
```

3. **Code Standards**:
   - Use TypeScript for all new code
   - Follow the therapeutic design system
   - Add proper accessibility attributes
   - Test on mobile devices
   - Follow conventional commit messages

### For External Contributors

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes** (frontend only without VM access)
4. **Test locally** with `npm run dev`
5. **Submit a pull request**

### Development Guidelines

- **File Size Limit**: No file should exceed 500 lines
- **Testing**: Add unit tests for new features
- **Documentation**: Update README and comments
- **Security**: Follow HIPAA compliance guidelines
- **Performance**: Maintain <700ms response times

## 📊 Monitoring & Management

### Application Management

```bash
# Check application status
ssh sysadmin@everkind-demo.15rock.com 'pm2 status'

# View application logs
ssh sysadmin@everkind-demo.15rock.com 'pm2 logs everkind'

# Restart application
ssh sysadmin@everkind-demo.15rock.com 'pm2 restart everkind'

# Check SSL certificate
curl -I https://everkind-demo.15rock.com
```

### Health Monitoring

- **Health Endpoint**: https://everkind-demo.15rock.com/api/health
- **Application Logs**: PM2 logs via `pm2 logs everkind`
- **Server Logs**: Caddy logs via `journalctl -u caddy`
- **SSL Certificate**: Auto-renewal via Let's Encrypt

## 🗺️ Roadmap

### Phase 1: MVP (Months 1-3) ✅
- [x] Frontend chat interface
- [x] Production deployment
- [x] SSL/TLS security
- [x] Basic health monitoring

### Phase 2: Core Features (Months 4-6)
- [ ] FastAPI backend
- [ ] User authentication
- [ ] Database integration
- [ ] Basic CBT modules

### Phase 3: Voice Integration (Months 7-9)
- [ ] WebSocket voice streaming
- [ ] Speech-to-text processing
- [ ] Text-to-speech synthesis
- [ ] Real-time conversation

### Phase 4: Advanced Features (Months 10-12)
- [ ] Advanced CBT techniques
- [ ] Crisis management system
- [ ] Analytics dashboard
- [ ] Mobile application

## 📋 Current Status

- ✅ **Frontend**: Deployed and accessible
- ✅ **Infrastructure**: Production-ready with SSL
- ✅ **Monitoring**: Health checks and logging
- 🔄 **Backend**: In development
- 🔄 **Voice Features**: Planned
- 🔄 **Authentication**: Planned

## 📞 Support

- **Issues**: Create GitHub issues for bugs/features
- **Documentation**: See [PLANNING.md](./PLANNING.md) for architecture
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guide
- **Tasks**: See [TASKS.md](./TASKS.md) for development tasks

## 📄 License

This project is part of the EverKind AI Therapeutic Voice Assistant platform.

---

**🌟 Ready to contribute?** Check out [TASKS.md](./TASKS.md) for current development priorities! 