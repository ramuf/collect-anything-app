#!/bin/bash
# Setup script for Docker development environment (Unix/Linux/macOS)
# Run this script to initialize the application for the first time

set -e

echo "🚀 Collect Anything App - Docker Setup"
echo "======================================"
echo ""

# Check if Docker is installed
echo "Checking Docker installation..."
if command -v docker &> /dev/null; then
    docker_version=$(docker --version)
    echo "✓ Docker found: $docker_version"
else
    echo "✗ Docker is not installed or not in PATH"
    echo "Please install Docker from https://www.docker.com/get-started"
    exit 1
fi

# Check if Docker Compose is available
echo "Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    compose_version=$(docker-compose --version)
    echo "✓ Docker Compose found: $compose_version"
else
    echo "✗ Docker Compose is not installed or not in PATH"
    exit 1
fi

# Check if .env file exists
echo ""
echo "Checking environment configuration..."
if [ -f ".env" ]; then
    echo "✓ .env file already exists"
    read -p "Do you want to overwrite it with .env.example? (y/N): " response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        cp .env.example .env
        echo "✓ .env file updated from .env.example"
    fi
else
    cp .env.example .env
    echo "✓ Created .env file from .env.example"
fi

# Check if backend .env exists
if [ -f "backend/.env" ]; then
    echo "✓ backend/.env file already exists"
else
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo "✓ Created backend/.env from backend/.env.example"
    fi
fi

# Ask which mode to run
echo ""
echo "Choose deployment mode:"
echo "1. Development (with hot reload)"
echo "2. Production"
echo "3. Exit"
read -p "Enter your choice (1-3): " mode

case $mode in
    1)
        echo ""
        echo "🔨 Building and starting services in DEVELOPMENT mode..."
        docker-compose -f docker-compose.dev.yml up --build -d
        
        echo ""
        echo "⏳ Waiting for services to be ready..."
        sleep 15
        
        echo ""
        echo "📊 Service status:"
        docker-compose -f docker-compose.dev.yml ps
        
        echo ""
        echo "✅ Setup complete! Services are running:"
        echo "   Frontend:  http://localhost:3000"
        echo "   Backend:   http://localhost:8000"
        echo "   API Docs:  http://localhost:8000/docs"
        echo ""
        echo "Useful commands:"
        echo "   View logs:     docker-compose -f docker-compose.dev.yml logs -f"
        echo "   Stop services: docker-compose -f docker-compose.dev.yml down"
        echo "   Restart:       docker-compose -f docker-compose.dev.yml restart"
        ;;
    2)
        echo ""
        echo "🔨 Building and starting services in PRODUCTION mode..."
        docker-compose up --build -d
        
        echo ""
        echo "⏳ Waiting for services to be ready..."
        sleep 20
        
        echo ""
        echo "📊 Service status:"
        docker-compose ps
        
        echo ""
        echo "✅ Setup complete! Services are running:"
        echo "   Frontend:  http://localhost:3000"
        echo "   Backend:   http://localhost:8000"
        echo "   API Docs:  http://localhost:8000/docs"
        echo ""
        echo "Useful commands:"
        echo "   View logs:     docker-compose logs -f"
        echo "   Stop services: docker-compose down"
        echo "   Restart:       docker-compose restart"
        ;;
    3)
        echo "Setup cancelled."
        exit 0
        ;;
    *)
        echo "Invalid choice. Setup cancelled."
        exit 1
        ;;
esac

echo ""
echo "📖 For more information, see CONTAINERIZATION.md"
