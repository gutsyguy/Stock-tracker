#!/bin/bash

# Stock Tracker Backend Run Script

# Set default environment variables if not already set
export DATABASE_URL=${DATABASE_URL:-"postgres://postgres:postgres@localhost:5432/stock_tracker?sslmode=disable"}
export PORT=${PORT:-"8080"}
export GIN_MODE=${GIN_MODE:-"debug"}
export CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS:-"http://localhost:3000"}

echo "Starting Stock Tracker Backend..."
echo "Database URL: $DATABASE_URL"
echo "Port: $PORT"
echo "Gin Mode: $GIN_MODE"
echo "CORS Origins: $CORS_ALLOWED_ORIGINS"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "⚠️  Warning: PostgreSQL doesn't appear to be running."
    echo "   The server will start but database operations will fail."
    echo "   To start PostgreSQL: brew services start postgresql"
    echo ""
fi

# Run the server
go run cmd/server/main.go
