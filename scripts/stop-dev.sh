#!/bin/bash

# Script to stop all development services
echo "🛑 Stopping all development services..."

# Kill all node processes (backend and frontend)
pkill -f "node.*saas-app-backend" 2>/dev/null
pkill -f "node.*saas-app-frontend" 2>/dev/null

# Kill MongoDB
pkill mongod 2>/dev/null

echo "✅ All services stopped"