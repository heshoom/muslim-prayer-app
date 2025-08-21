#!/bin/bash

# Production deployment script for Muslim Prayer App Backend

echo "🚀 Deploying Muslim Prayer App Backend..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please create one from .env.example"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Start the server
echo "🌟 Starting production server..."
npm start
