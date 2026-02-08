# Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Software
- **Node.js**: v20 or higher
- **pnpm**: v10 or higher (or npm)
- **MongoDB**: v7.0 or higher
- **Redis**: v7.0 or higher
- **Docker**: v24 or higher (for containerized deployment)
- **Docker Compose**: v2.20 or higher

### Required API Keys
- **OpenAI API Key**: For AI features
- **Google OAuth** (optional): For Google Calendar integration
- **Microsoft OAuth** (optional): For Outlook integration

---

## Local Development

### 1. Clone the Repository
```bash
git clone <repository-url>
cd schedule-manager
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start MongoDB and Redis (if not running)
# Option 1: Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Option 2: Using local installation
# Start MongoDB: mongod
# Start Redis: redis-server

# Start development server
pnpm run dev
```

Backend will run on `http://localhost:5000`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start development server
pnpm run dev
```

Frontend will run on `http://localhost:5173`

---

## Docker Deployment

### Quick Start with Docker Compose

```bash
# From the schedule-manager directory

# 1. Set environment variables
export OPENAI_API_KEY=your-api-key
export JWT_SECRET=your-secret-key

# 2. Build and start all services
docker-compose up -d

# 3. Check logs
docker-compose logs -f

# 4. Stop services
docker-compose down

# 5. Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

### Custom Configuration

Edit `docker-compose.yml` to customize:
- Port mappings
- Environment variables
- Volume mounts
- Resource limits

---

## Production Deployment

### Option 1: Docker Compose (Simple)

```bash
# 1. Create production environment file
cat > .env.production << EOF
OPENAI_API_KEY=your-production-api-key
JWT_SECRET=your-production-secret
MONGODB_URI=mongodb://admin:password@mongodb:27017/schedule_manager?authSource=admin
REDIS_URL=redis://redis:6379
NODE_ENV=production
EOF

# 2. Deploy with production profile
docker-compose --env-file .env.production up -d

# 3. Enable Nginx reverse proxy (optional)
docker-compose --profile production up -d
```

### Option 2: Kubernetes (Scalable)

```bash
# 1. Create namespace
kubectl create namespace schedule-manager

# 2. Create secrets
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=your-secret \
  --from-literal=openai-api-key=your-key \
  -n schedule-manager

# 3. Apply configurations
kubectl apply -f k8s/ -n schedule-manager

# 4. Check deployment status
kubectl get pods -n schedule-manager

# 5. Get service URL
kubectl get svc -n schedule-manager
```

### Option 3: Cloud Platforms

#### AWS (Elastic Beanstalk)
```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init

# Create environment
eb create production

# Deploy
eb deploy
```

#### Google Cloud (Cloud Run)
```bash
# Build and push images
gcloud builds submit --tag gcr.io/PROJECT_ID/schedule-manager-backend ./backend
gcloud builds submit --tag gcr.io/PROJECT_ID/schedule-manager-frontend ./frontend

# Deploy
gcloud run deploy backend --image gcr.io/PROJECT_ID/schedule-manager-backend
gcloud run deploy frontend --image gcr.io/PROJECT_ID/schedule-manager-frontend
```

#### Heroku
```bash
# Login
heroku login

# Create apps
heroku create schedule-manager-api
heroku create schedule-manager-web

# Add MongoDB and Redis
heroku addons:create mongolab:sandbox -a schedule-manager-api
heroku addons:create heroku-redis:hobby-dev -a schedule-manager-api

# Deploy
git subtree push --prefix backend heroku main
```

---

## Environment Configuration

### Backend Environment Variables

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/schedule_manager
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-key-min-32-characters
JWT_EXPIRE=7d

# AI Configuration
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Client URL
CLIENT_URL=https://your-domain.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

```env
# API Configuration
VITE_API_URL=https://api.your-domain.com/api
VITE_WS_URL=https://api.your-domain.com

# Feature Flags (Optional)
VITE_ENABLE_AI=true
VITE_ENABLE_COLLABORATION=true
VITE_ENABLE_VIDEO=false
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# Frontend health
curl http://localhost:3000/health
```

### Logs

```bash
# Docker Compose logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Kubernetes logs
kubectl logs -f deployment/backend -n schedule-manager
kubectl logs -f deployment/frontend -n schedule-manager
```

### Database Backup

```bash
# MongoDB backup
docker exec mongodb mongodump --out /backup

# Copy backup from container
docker cp mongodb:/backup ./mongodb-backup-$(date +%Y%m%d)

# Restore
docker exec mongodb mongorestore /backup
```

### Scaling

```bash
# Docker Compose (limited)
docker-compose up -d --scale backend=3

# Kubernetes
kubectl scale deployment backend --replicas=5 -n schedule-manager
```

---

## Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```bash
# Check MongoDB is running
docker ps | grep mongodb

# Check connection string
echo $MONGODB_URI

# Test connection
mongosh $MONGODB_URI
```

**2. Redis Connection Failed**
```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli ping
```

**3. Frontend Can't Connect to Backend**
```bash
# Check CORS settings in backend
# Check VITE_API_URL in frontend .env
# Check network connectivity
curl http://localhost:5000/api/health
```

---

## Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong MongoDB passwords
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Backup encryption keys
- [ ] Monitor access logs
- [ ] Implement 2FA
- [ ] Regular security audits

---

## Performance Optimization

### Database Optimization
```javascript
// Create indexes
db.tasks.createIndex({ user: 1, status: 1, dueDate: 1 })
db.tasks.createIndex({ workspace: 1 })
db.calendarEvents.createIndex({ user: 1, start: 1, end: 1 })
```

### Redis Caching
```bash
# Monitor cache hit rate
redis-cli info stats | grep keyspace

# Clear cache if needed
redis-cli FLUSHDB
```

### CDN Configuration
- Use CloudFlare or AWS CloudFront
- Cache static assets
- Enable Gzip compression
- Optimize images

---

**Last Updated**: 2026-02-07

