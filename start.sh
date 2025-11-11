#!/bin/bash

# AI Career Mentor - Startup Script

set -e

echo "🚀 Starting AI Career Mentor..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.simple .env
    echo "✅ Created .env file"
    echo ""
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Determine profile
PROFILE="${1:-cpu}"

if [ "$PROFILE" != "cpu" ] && [ "$PROFILE" != "gpu" ] && [ "$PROFILE" != "full" ]; then
    echo "❌ Invalid profile: $PROFILE"
    echo "Usage: ./start.sh [cpu|gpu|full]"
    echo "  cpu  - CPU-only mode (no GPU required)"
    echo "  gpu  - GPU mode (requires NVIDIA GPU)"
    echo "  full - Full stack with observability (Jaeger, Prometheus, Grafana)"
    exit 1
fi

echo "📦 Starting services with profile: $PROFILE"
echo ""

# Start services
docker-compose -f docker-compose.simple.yml --profile $PROFILE up -d

echo ""
echo "⏳ Waiting for services to start..."
echo "   This may take 5-10 minutes on first run (downloading models)"
echo ""

# Wait for API service
echo "Waiting for API Service..."
until curl -s http://localhost:8080/health > /dev/null 2>&1; do
    sleep 2
    echo -n "."
done
echo " ✅ API Service ready!"

# Wait for Knowledge service
echo "Waiting for Knowledge Service..."
until curl -s http://localhost:8081/health > /dev/null 2>&1; do
    sleep 2
    echo -n "."
done
echo " ✅ Knowledge Service ready!"

# Wait for Frontend
echo "Waiting for Frontend..."
until curl -s http://localhost:3000 > /dev/null 2>&1; do
    sleep 2
    echo -n "."
done
echo " ✅ Frontend ready!"

echo ""
echo "🎉 All services are running!"
echo ""
echo "📍 Access the application:"
echo "   Frontend:  http://localhost:3000"
echo "   API Docs:  http://localhost:8080/docs"
echo "   Health:    http://localhost:8080/health"
echo ""

if [ "$PROFILE" = "full" ]; then
    echo "📊 Observability:"
    echo "   Jaeger:    http://localhost:16686"
    echo "   Grafana:   http://localhost:3001 (admin/admin)"
    echo "   Prometheus: http://localhost:9090"
    echo ""
fi

echo "💡 Tips:"
echo "   - View logs: docker-compose -f docker-compose.simple.yml logs -f"
echo "   - Stop: docker-compose -f docker-compose.simple.yml down"
echo "   - Restart: docker-compose -f docker-compose.simple.yml restart <service>"
echo ""
echo "Happy mentoring! 🚀"
