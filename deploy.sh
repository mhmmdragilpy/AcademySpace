#!/bin/bash

# Deploy Script
echo "Starting Deployment..."

# 1. Pull latest code (if applicable, here we assume code is local)
# git pull origin main

# 2. Build and Start Containers
echo "Building and Starting Containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# 3. Wait for Database
echo "Waiting for Database..."
sleep 10

# 4. Run Migrations
# Assuming backend container has a script or we run via exec
# Since the backend image is production (node:alpine), it might not have psql.
# We should rely on the application to migrate or a separate migration container.
# For now, we will execute a node script inside the running backend container.

echo "Running Migrations..."
docker exec academy_space_backend_prod node dist/db/migrate.js

echo "Deployment Complete!"
