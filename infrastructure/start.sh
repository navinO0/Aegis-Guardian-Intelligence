#!/bin/bash

if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "------------------------------------------------"
echo "🚀 Starting Docu-Guardian Infrastructure..."
echo "------------------------------------------------"

docker network inspect app-network >/dev/null 2>&1 || docker network create app-network

if [ "$ENABLE_POSTGRES" = "true" ]; then
    echo "🐘 Starting Postgres..."
    (cd postgres && docker compose --env-file ../.env up -d)
    echo "   📍 Postgres: localhost:5432"
fi

if [ "$ENABLE_REDIS" = "true" ]; then
    echo "📦 Starting Cache (Redis)..."
    (cd cache && docker compose --env-file ../.env up -d)
    echo "   📍 Redis: localhost:6379"
fi

if [ "$ENABLE_NGINX" = "true" ]; then
    echo "🌐 Starting Nginx Gateway..."
    (cd nginx && docker compose --env-file ../.env up -d)
    echo "   📍 Entry: http://localhost (Routing to :4000)"
fi

if [ "$ENABLE_PROMETHEUS" = "true" ]; then
    echo "📊 Starting Monitoring (Prometheus)..."
    (cd prometheus && docker compose --env-file ../.env up -d)
    echo "   📍 Prometheus: http://localhost:9090"
fi

echo "------------------------------------------------"
echo "✅ Core infrastructure is up!"
echo "------------------------------------------------"
