#!/bin/bash

# SaaS Platform MVP - Production Deployment Script
# Phase 3: Integration & MVP Finalization

set -e

echo "🚀 Starting SaaS Platform MVP Production Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="saas-platform-mvp"
BACKUP_DIR="./backups"
LOG_DIR="./logs"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check environment file
    if [ ! -f ".env.production" ]; then
        log_error ".env.production file not found. Please create it from .env.example"
        exit 1
    fi
    
    log_success "Prerequisites check completed"
}

# Create necessary directories
create_directories() {
    log_info "Creating necessary directories..."
    
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$LOG_DIR/nginx"
    mkdir -p "./ssl"
    mkdir -p "./nginx/sites-available"
    
    log_success "Directories created"
}

# Load environment variables
load_environment() {
    log_info "Loading environment variables..."
    
    if [ -f ".env.production" ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
        log_success "Environment variables loaded"
    else
        log_error "Environment file not found"
        exit 1
    fi
}

# Backup existing data
backup_data() {
    log_info "Creating backup of existing data..."
    
    # Create timestamped backup directory
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
    mkdir -p "$BACKUP_PATH"
    
    # Backup MongoDB if container exists
    if docker ps -a | grep -q saas-mongodb-prod; then
        log_info "Backing up MongoDB data..."
        docker exec saas-mongodb-prod mongodump \
            --uri="mongodb://admin:${MONGO_PASSWORD}@localhost:27017/saas_platform_prod" \
            --out="/tmp/backup_$TIMESTAMP" 2>/dev/null || true
            
        docker cp saas-mongodb-prod:/tmp/backup_$TIMESTAMP "$BACKUP_PATH/" 2>/dev/null || true
    fi
    
    # Backup Redis if container exists
    if docker ps -a | grep -q saas-redis-prod; then
        log_info "Backing up Redis data..."
        docker exec saas-redis-prod redis-cli --rdb /tmp/dump_$TIMESTAMP.rdb 2>/dev/null || true
        docker cp saas-redis-prod:/tmp/dump_$TIMESTAMP.rdb "$BACKUP_PATH/" 2>/dev/null || true
    fi
    
    log_success "Backup completed: $BACKUP_PATH"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install backend dependencies
    log_info "Installing backend dependencies..."
    cd saas-app-backend && npm ci --only=production && cd ..
    
    # Install frontend dependencies  
    log_info "Installing frontend dependencies..."
    cd saas-app-frontend && npm ci && cd ..
    
    log_success "Dependencies installed"
}

# Build applications
build_applications() {
    log_info "Building applications..."
    
    # Build backend
    log_info "Building backend..."
    cd saas-app-backend && npm run build && cd ..
    
    # Build frontend
    log_info "Building frontend..."
    cd saas-app-frontend && npm run build && cd ..
    
    log_success "Applications built successfully"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Backend tests
    log_info "Running backend tests..."
    cd saas-app-backend && npm run test && cd ..
    
    # Integration tests
    log_info "Running integration tests..."
    cd saas-app-backend && npm run test:integration && cd ..
    
    # Frontend tests
    log_info "Running frontend tests..."
    cd saas-app-frontend && npm run test:ci && cd ..
    
    log_success "All tests passed"
}

# Build Docker images
build_docker_images() {
    log_info "Building Docker images..."
    
    # Build images
    docker-compose -f docker-compose.prod.yml build --no-cache
    
    log_success "Docker images built successfully"
}

# Deploy services
deploy_services() {
    log_info "Deploying services..."
    
    # Stop existing services
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "Services deployed"
}

# Wait for services to be ready
wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    # Wait for backend health check
    log_info "Waiting for backend to be ready..."
    for i in {1..30}; do
        if curl -f http://localhost:3000/health &>/dev/null; then
            log_success "Backend is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "Backend failed to start within timeout"
            exit 1
        fi
        sleep 2
    done
    
    # Wait for MongoDB
    log_info "Waiting for MongoDB to be ready..."
    for i in {1..30}; do
        if docker exec saas-mongodb-prod mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
            log_success "MongoDB is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "MongoDB failed to start within timeout"
            exit 1
        fi
        sleep 2
    done
    
    # Wait for Redis
    log_info "Waiting for Redis to be ready..."
    for i in {1..30}; do
        if docker exec saas-redis-prod redis-cli ping &>/dev/null; then
            log_success "Redis is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            log_error "Redis failed to start within timeout"
            exit 1
        fi
        sleep 2
    done
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Run migration script
    if [ -f "scripts/migrate-production.js" ]; then
        docker exec saas-backend-prod node scripts/migrate-production.js
        log_success "Database migrations completed"
    else
        log_warning "No migration script found, skipping..."
    fi
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check service status
    log_info "Checking service status..."
    docker-compose -f docker-compose.prod.yml ps
    
    # Health checks
    log_info "Running health checks..."
    
    # Backend health
    if curl -f http://localhost:3000/health; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
        exit 1
    fi
    
    # Database connectivity
    if curl -f http://localhost:3000/health/database; then
        log_success "Database connectivity check passed"
    else
        log_error "Database connectivity check failed"
        exit 1
    fi
    
    # Frontend accessibility
    if curl -f http://localhost:4200; then
        log_success "Frontend accessibility check passed"
    else
        log_error "Frontend accessibility check failed"
        exit 1
    fi
    
    log_success "All health checks passed"
}

# Generate deployment report
generate_report() {
    log_info "Generating deployment report..."
    
    REPORT_FILE="./logs/deployment_report_$(date +%Y%m%d_%H%M%S).txt"
    
    cat > "$REPORT_FILE" << EOF
SaaS Platform MVP - Deployment Report
=====================================
Deployment Date: $(date)
Project: $PROJECT_NAME
Environment: Production

Service Status:
$(docker-compose -f docker-compose.prod.yml ps)

Container Health:
$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")

System Resources:
$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}")

Deployment Configuration:
- Backend Port: 3000
- Frontend Port: 4200  
- Database: MongoDB (Port 27017)
- Cache: Redis (Port 6379)
- Reverse Proxy: Nginx (Ports 80, 443)

Health Check URLs:
- Backend: http://localhost:3000/health
- Database: http://localhost:3000/health/database
- Cache: http://localhost:3000/health/cache
- Frontend: http://localhost:4200

Next Steps:
1. Configure SSL certificates in ./ssl/
2. Update DNS records to point to server IP
3. Configure monitoring and alerting
4. Schedule regular backups
5. Review security configurations

Deployment Status: SUCCESS
EOF

    log_success "Deployment report generated: $REPORT_FILE"
}

# Main deployment process
main() {
    log_info "Starting deployment process..."
    
    check_prerequisites
    create_directories
    load_environment
    backup_data
    install_dependencies
    build_applications
    run_tests
    build_docker_images
    deploy_services
    wait_for_services
    run_migrations
    verify_deployment
    generate_report
    
    echo ""
    echo "🎉 SaaS Platform MVP Deployment Complete! 🎉"
    echo "============================================="
    echo ""
    echo "Services are running on:"
    echo "- Backend API: http://localhost:3000"
    echo "- Frontend App: http://localhost:4200"
    echo "- API Documentation: http://localhost:3000/api-docs"
    echo ""
    echo "Administration:"
    echo "- View logs: docker-compose -f docker-compose.prod.yml logs -f"
    echo "- Stop services: docker-compose -f docker-compose.prod.yml down"
    echo "- Service status: docker-compose -f docker-compose.prod.yml ps"
    echo ""
    echo "Phase 3 - MVP Integration & Finalization: ✅ COMPLETE"
    echo ""
}

# Run deployment
main "$@"