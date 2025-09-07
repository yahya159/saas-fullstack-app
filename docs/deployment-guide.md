# SaaS Platform MVP - Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the SaaS Platform MVP to production environments, including configuration, database setup, and monitoring.

## Prerequisites
- Node.js 18+ LTS
- MongoDB 6.0+
- Docker & Docker Compose (recommended)
- Git
- SSL certificates for HTTPS

## Environment Configuration

### Backend Environment Variables
Create `/saas-app-backend/.env.production`:

```bash
# Application
NODE_ENV=production
PORT=3000
APP_NAME=SaaS Platform MVP

# Database
MONGODB_URI=mongodb://username:password@host:27017/saas_platform_prod
MONGODB_OPTIONS=retryWrites=true&w=majority&ssl=true

# Security
JWT_SECRET=your-super-secure-jwt-secret-256-bits-minimum
JWT_EXPIRATION=24h
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://yourdomain.com

# Redis Cache (Optional but recommended)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# Email Service (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-smtp-password

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=https://your-sentry-dsn

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables  
Create `/saas-app-frontend/.env.production`:

```bash
# API Configuration
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME=SaaS Platform MVP
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_MARKETING_MODULE=true
VITE_ENABLE_ROLE_MANAGEMENT=true

# External Services
VITE_SENTRY_DSN=https://your-frontend-sentry-dsn
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

## Database Setup

### MongoDB Configuration
1. **Create Production Database**:
```bash
# Connect to MongoDB
mongosh "mongodb://username:password@host:27017/saas_platform_prod"

# Create collections with proper indexing
db.createCollection("users")
db.createCollection("saasroles") 
db.createCollection("saasuserroles")
db.createCollection("saasmarketingcampaigns")
db.createCollection("saasplanfeatures")
db.createCollection("saasapplications")
```

2. **Create Indexes for Performance**:
```javascript
// User indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "createdAt": 1 })

// Role management indexes
db.saasuserroles.createIndex({ "userId": 1, "applicationId": 1 })
db.saasuserroles.createIndex({ "applicationId": 1, "roleType": 1 })
db.saasuserroles.createIndex({ "assignedAt": 1 })

// Marketing campaign indexes
db.saasmarketingcampaigns.createIndex({ "applicationId": 1, "status": 1 })
db.saasmarketingcampaigns.createIndex({ "type": 1, "createdAt": 1 })
db.saasmarketingcampaigns.createIndex({ "userId": 1 })

// Plan feature indexes
db.saasplanfeatures.createIndex({ "planId": 1, "featureType": 1 }, { unique: true })
db.saasplanfeatures.createIndex({ "applicationId": 1 })

// Application indexes
db.saasapplications.createIndex({ "ownerId": 1 })
db.saasapplications.createIndex({ "name": 1 })
```

3. **Database Migration Script**:
```javascript
// Migration script for production data
// File: /scripts/migrate-production.js

const { MongoClient } = require('mongodb');

async function migrate() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Create default roles
    await db.collection('saasroles').insertMany([
      {
        name: 'CUSTOMER_ADMIN',
        description: 'CTO, Directeur Technique, Architecte Senior',
        permissions: ['technicalConfiguration', 'marketingDashboard', 'planConfiguration'],
        createdAt: new Date()
      },
      {
        name: 'CUSTOMER_MANAGER', 
        description: 'Product Manager, Chef de projet technique',
        permissions: ['marketingDashboard', 'planConfiguration:READ'],
        createdAt: new Date()
      },
      {
        name: 'CUSTOMER_DEVELOPER',
        description: 'Développeur Senior, Ingénieur Full-Stack', 
        permissions: ['apiDocumentation'],
        createdAt: new Date()
      }
    ]);
    
    console.log('Migration completed successfully');
  } finally {
    await client.close();
  }
}

migrate().catch(console.error);
```

## Docker Deployment

### Docker Compose Configuration
Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # Backend Service
  backend:
    build: 
      context: ./saas-app-backend
      dockerfile: Dockerfile.prod
    container_name: saas-backend-prod
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_HOST=redis
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend Service
  frontend:
    build:
      context: ./saas-app-frontend  
      dockerfile: Dockerfile.prod
    container_name: saas-frontend-prod
    environment:
      - VITE_API_BASE_URL=${API_BASE_URL}
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/ssl/certs
    restart: unless-stopped
    depends_on:
      - backend

  # MongoDB Service
  mongodb:
    image: mongo:6.0
    container_name: saas-mongodb-prod
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}
      - MONGO_INITDB_DATABASE=saas_platform_prod
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./mongodb-init:/docker-entrypoint-initdb.d
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: saas-redis-prod
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --requirepass ${REDIS_PASSWORD}
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: saas-nginx-prod
    ports:
      - "80:80"
      - "443:443"  
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  mongodb_data:
  redis_data:
```

### Backend Dockerfile.prod
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "dist/main.js"]
```

### Frontend Dockerfile.prod  
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx
RUN adduser -S nginx -u 1001

# Set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

## Nginx Configuration
Create `nginx/nginx.conf`:

```nginx
upstream backend {
    server backend:3000;
}

upstream frontend {
    server frontend:80;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/certificate.crt;
    ssl_certificate_key /etc/nginx/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API routes
    location /api/ {
        proxy_pass http://backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://yourdomain.com";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    }

    # Frontend routes  
    location / {
        proxy_pass http://frontend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Handle Angular routing
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Deployment Commands

### 1. Initial Deployment
```bash
# Clone repository
git clone https://github.com/yourusername/saas-fullstack-app.git
cd saas-fullstack-app

# Set up environment variables
cp .env.example .env.production
# Edit .env.production with your values

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker exec saas-backend-prod npm run migrate:prod

# Verify deployment
curl -f http://localhost:3000/health
```

### 2. Update Deployment
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose -f docker-compose.prod.yml up -d --build

# Run any new migrations
docker exec saas-backend-prod npm run migrate:prod

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Rollback Deployment
```bash
# Stop current services
docker-compose -f docker-compose.prod.yml down

# Checkout previous version
git checkout <previous-commit-hash>

# Deploy previous version
docker-compose -f docker-compose.prod.yml up -d --build
```

## Monitoring & Logging

### Health Check Endpoints
```bash
# Backend health
curl https://api.yourdomain.com/health

# Database connectivity
curl https://api.yourdomain.com/health/database

# Redis connectivity  
curl https://api.yourdomain.com/health/cache
```

### Log Management
```bash
# View application logs
docker logs saas-backend-prod -f
docker logs saas-frontend-prod -f

# View nginx logs
docker logs saas-nginx-prod -f

# Export logs for analysis
docker logs saas-backend-prod > backend-$(date +%Y%m%d).log
```

### Performance Monitoring
- **Response time monitoring**: Set up alerts for >2s response times
- **Error rate monitoring**: Alert on >5% error rates
- **Resource monitoring**: Monitor CPU/Memory usage
- **Database monitoring**: Track connection pool and query performance

## Security Checklist

### Pre-Deployment Security
- [ ] JWT secrets are secure and rotated regularly
- [ ] Database credentials use strong passwords
- [ ] SSL/TLS certificates are valid and configured
- [ ] CORS origins are properly restricted
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] SQL injection protection (using Mongoose/ODM)
- [ ] XSS protection headers configured
- [ ] CSRF protection enabled

### Post-Deployment Security
- [ ] Security headers verified (use securityheaders.com)
- [ ] SSL configuration tested (use ssllabs.com)
- [ ] Vulnerability scanning performed
- [ ] Access logs monitored
- [ ] Backup procedures tested

## Backup & Recovery

### Database Backup
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="/backups/mongodb"

# Create backup
docker exec saas-mongodb-prod mongodump \
  --uri="$MONGODB_URI" \
  --out="/tmp/backup_$DATE"

# Copy to host
docker cp saas-mongodb-prod:/tmp/backup_$DATE $BACKUP_PATH/

# Compress and clean
tar -czf $BACKUP_PATH/backup_$DATE.tar.gz $BACKUP_PATH/backup_$DATE/
rm -rf $BACKUP_PATH/backup_$DATE/

# Keep only last 7 days
find $BACKUP_PATH -name "backup_*.tar.gz" -mtime +7 -delete
```

### Recovery Process
```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore database
tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz
docker exec -i saas-mongodb-prod mongorestore \
  --uri="$MONGODB_URI" \
  --drop /tmp/backup_YYYYMMDD_HHMMSS/

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Verify MongoDB credentials and network connectivity
   - Check firewall rules and security groups

2. **Frontend Build Failures**
   - Clear node_modules and package-lock.json
   - Verify Node.js version compatibility

3. **SSL Certificate Errors**  
   - Verify certificate chain is complete
   - Check certificate expiration dates

4. **Performance Issues**
   - Enable Redis caching
   - Review database query performance
   - Check resource allocation (CPU/Memory)

### Diagnostic Commands
```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View resource usage
docker stats

# Test database connection
docker exec saas-backend-prod npm run test:db

# Check nginx configuration
docker exec saas-nginx-prod nginx -t
```

This deployment guide ensures a production-ready SaaS Platform MVP with proper security, monitoring, and scalability considerations.