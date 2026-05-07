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

if [ "$ENABLE_GRAFANA" = "true" ]; then
    echo "📈 Starting Visualization (Grafana)..."
    (cd grafana && docker compose --env-file ../.env up -d)
    echo "   📍 Grafana: http://localhost:3001"
fi

if [ "$ENABLE_LOKI" = "true" ]; then
    echo "📁 Starting Log Aggregation (Loki)..."
    (cd loki && docker compose --env-file ../.env up -d)
    echo "   📍 Loki: http://localhost:3100"
fi

if [ "$ENABLE_PROMTAIL" = "true" ]; then
    echo "🚛 Starting Log Shipper (Promtail)..."
    (cd promtail && docker compose --env-file ../.env up -d)
fi

if [ "$ENABLE_JENKINS" = "true" ]; then
    echo "🏗️  Starting Build System (Jenkins)..."
    (cd jenkins && docker compose --env-file ../.env up -d)
    echo "   📍 Jenkins: http://localhost/jenkins"
fi

echo "------------------------------------------------"
echo "✅ Core infrastructure is up!"
echo "------------------------------------------------"
echo "🔗 ACCESS LINKS:"
echo "   🛡️  Aegis Gateway:   http://localhost"
echo "   🖥️  System Status:  http://localhost/status"
echo "   🏗️  Jenkins CI:     http://localhost/jenkins"
echo "   📚  Swagger Docs:    http://localhost/docs"
echo "   📈  Grafana:         http://localhost:3001"
echo "   📁  Loki (Logs):     http://localhost:3100"
echo "   🐘  Postgres:        localhost:5432"
echo "   📦  Redis:           localhost:6379"
echo "------------------------------------------------"
