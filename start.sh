#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "  🏛️  Starting Association Dues & Member Management Portal "
echo "=========================================================="

export JAVA_HOME="/Library/Java/JavaVirtualMachines/jdk-26.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

# 1. Start Backend
echo "📦 Starting Spring Boot REST Backend on port 8080..."
cd backend
mvn clean package -DskipTests
java -jar target/duesportal-backend-1.0.0.jar &
BACKEND_PID=$!
cd ..

# 2. Start Frontend
echo "✨ Starting React Frontend on port 3000..."
cd frontend
npm run dev -- --host 0.0.0.0 --port 3000 &
FRONTEND_PID=$!
cd ..

echo ""
echo "🚀 Application is running!"
echo "   - Web Portal: http://localhost:3000"
echo "   - REST API:   http://localhost:8080/api"
echo "   - H2 Console: http://localhost:8080/h2-console"
echo ""

# Handle shutdown
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true" EXIT
wait

