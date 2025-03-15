#!/bin/bash

echo "🚀 Starting full deployment..."

# Run frontend deployment
echo "📱 Deploying frontend..."
./deploy-frontend.sh

# Run backend deployment
echo "⚙️ Deploying backend..."
./deploy-backend.sh

echo "✅ Full deployment completed!" 