#!/bin/bash

# Build and start the containers
echo "🚀 Starting project locally..."
docker-compose up --build -d

echo ""
echo "🔗 Access your application at:"
echo "------------------------------"
echo "Frontend: http://localhost:8080"
echo "Backend Health: http://localhost:3000/health"
echo "Backend Readiness: http://localhost:3000/ready"
echo "------------------------------"
echo ""
echo "📝 To view logs, run: docker-compose logs -f"
echo "🛑 To stop the project, run: docker-compose down"
