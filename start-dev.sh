#!/bin/bash

echo "🏦 Starting Aegis Bank Development Environment"
echo "================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start MySQL database
echo "📊 Starting MySQL database..."
docker-compose up -d mysql

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 10

# Start backend
echo "🔧 Starting Spring Boot backend..."
cd backend
./mvnw spring-boot:run &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 15

# Start frontend
echo "🎨 Starting React frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Aegis Bank is now running!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8080/api"
echo "📊 MySQL: localhost:3307"
echo ""
echo "👤 Demo Admin Credentials:"
echo "   Email: admin@hellenicbank.com"
echo "   Password: admin123"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    docker-compose down
    echo "✅ All services stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for user to stop
wait
