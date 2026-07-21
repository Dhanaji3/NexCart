#!/bin/bash
# Quick start script for local development
set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Vue Micro-Frontends - Local Development Quick Start         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop."
    exit 1
fi

echo "✓ Docker detected"

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed"
        exit 1
    fi
    DOCKER_COMPOSE="docker-compose"
else
    DOCKER_COMPOSE="docker compose"
fi

echo "✓ Docker Compose detected"
echo ""

# Start services
echo "🚀 Starting all services..."
$DOCKER_COMPOSE up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check PostgreSQL
echo -n "  Checking PostgreSQL... "
for i in {1..30}; do
    if $DOCKER_COMPOSE exec -T postgres pg_isready -U postgres &> /dev/null; then
        echo "✓"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "✗ (timeout)"
    fi
    echo -n "."
    sleep 1
done

# Check Backend
echo -n "  Checking Backend... "
for i in {1..30}; do
    if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
        echo "✓"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "✗ (timeout, check logs)"
    fi
    echo -n "."
    sleep 1
done

# Check Frontend
echo -n "  Checking Frontend... "
for i in {1..10}; do
    if curl -s http://localhost > /dev/null 2>&1; then
        echo "✓"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "⚠ (still loading)"
    fi
    echo -n "."
    sleep 1
done

echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "✅ All services started successfully!"
echo ""
echo "📱 ACCESS POINTS:"
echo "   • Frontend:     http://localhost"
echo "   • Backend API:  http://localhost:8080/api"
echo "   • Swagger UI:   http://localhost:8080/swagger-ui.html"
echo "   • pgAdmin:      http://localhost:5050"
echo ""
echo "🛑 TO STOP SERVICES:"
echo "   docker-compose down"
echo ""
echo "📝 TO VIEW LOGS:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f frontend"
echo "   docker-compose logs -f postgres"
echo ""
echo "════════════════════════════════════════════════════════════════"
