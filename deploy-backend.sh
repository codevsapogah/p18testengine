#!/bin/bash

# Configuration
SERVER="p18"
DEPLOY_PATH="/var/www/p18v3"

echo "🚀 Starting backend deployment..."

# Upload backend files
echo "📤 Uploading backend files..."
scp -r server/* $SERVER:$DEPLOY_PATH/server/

# Upload environment file
echo "📤 Uploading environment file..."
scp .env.production $SERVER:$DEPLOY_PATH/.env

# Execute remote commands
echo "🔄 Restarting backend..."
ssh $SERVER "pm2 restart p18v3-backend --update-env && pm2 status"

echo "✅ Backend deployment completed!" 