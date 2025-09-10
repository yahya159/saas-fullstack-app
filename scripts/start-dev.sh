#!/bin/bash

# Development startup script for SaaS Platform MVP
echo "🚀 Starting SaaS Platform MVP Development Environment..."

# Create data directory for MongoDB if it doesn't exist
mkdir -p ./data/db

# Start MongoDB
echo "🔄 Starting MongoDB..."
mongod --dbpath ./data/db --port 27017 > ./logs/mongodb.log 2>&1 &
MONGO_PID=$!

# Wait for MongoDB to start
sleep 3

# Check if MongoDB started successfully
if ! kill -0 $MONGO_PID 2>/dev/null; then
    echo "❌ Failed to start MongoDB"
    echo "Please check logs/mongodb.log for details"
    exit 1
fi

echo "✅ MongoDB started successfully (PID: $MONGO_PID)"

# Start Backend
echo "🔄 Starting Backend server..."
cd saas-app-backend
npm run start:dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Failed to start Backend"
    echo "Please check logs/backend.log for details"
    # Kill MongoDB
    kill $MONGO_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend started successfully (PID: $BACKEND_PID)"

# Start Frontend
echo "🔄 Starting Frontend server..."
cd saas-app-frontend
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 10

# Check if frontend started successfully
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo "❌ Failed to start Frontend"
    echo "Please check logs/frontend.log for details"
    # Kill other processes
    kill $MONGO_PID $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend started successfully (PID: $FRONTEND_PID)"

echo ""
echo "🎉 All services started successfully!"
echo "   MongoDB:     localhost:27017"
echo "   Backend:     http://localhost:4000"
echo "   Frontend:    http://localhost:4200"
echo ""
echo "📝 Logs are available in the logs/ directory"
echo "🛑 To stop all services, press Ctrl+C"

# Wait for any process to exit
wait $MONGO_PID $BACKEND_PID $FRONTEND_PID

# If any process exits, kill the others
kill $MONGO_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null

echo ""
echo "👋 All services stopped"