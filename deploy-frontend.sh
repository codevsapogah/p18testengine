#!/bin/bash

# Configuration
SERVER="dias@78.40.108.81"
DEPLOY_PATH="/var/www/p18v3"

echo "🚀 Starting frontend deployment..."

# Build React app
echo "📦 Building React app..."
npm run build

# Set permissions on server first
echo "🔧 Preparing server directories..."
ssh $SERVER "sudo chown -R dias:dias $DEPLOY_PATH/build"

# Upload frontend build
echo "📤 Uploading frontend build..."
scp -r build/* $SERVER:$DEPLOY_PATH/build/

# Reset permissions for nginx
echo "🔧 Setting final permissions..."
ssh $SERVER "sudo chown -R www-data:www-data $DEPLOY_PATH/build"

echo "✅ Frontend deployment completed!" 