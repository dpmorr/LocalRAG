#!/bin/bash

# Health check script for all services

echo "🏥 Checking service health..."
echo ""

# API Service
echo -n "API Service (8080): "
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

# Knowledge Service
echo -n "Knowledge Service (8081): "
if curl -s http://localhost:8081/health > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

# Inference Service
echo -n "Inference Service (8000): "
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy (may still be loading model)"
fi

# Frontend
echo -n "Frontend (3000): "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

# PostgreSQL
echo -n "PostgreSQL (5432): "
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

# Redis
echo -n "Redis (6379): "
if redis-cli -h localhost -p 6379 ping > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

echo ""
echo "✨ Health check complete!"
