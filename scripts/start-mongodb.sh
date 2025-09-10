#!/bin/bash

# Script to start MongoDB for development
echo "Starting MongoDB for development..."

# Check if MongoDB is already running
if pgrep -x "mongod" > /dev/null
then
    echo "MongoDB is already running"
    exit 0
fi

# Start MongoDB in the background
mongod --dbpath ./data/db --port 27017 &

# Wait a moment for MongoDB to start
sleep 2

# Check if MongoDB started successfully
if pgrep -x "mongod" > /dev/null
then
    echo "MongoDB started successfully on port 27017"
    echo "Data directory: ./data/db"
    echo "To stop MongoDB, run: pkill mongod"
else
    echo "Failed to start MongoDB"
    exit 1
fi