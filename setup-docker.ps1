#!/usr/bin/env pwsh
# Setup script for Docker development environment
# Run this script to initialize the application for the first time

$ErrorActionPreference = "Stop"

Write-Host "🚀 Collect Anything App - Docker Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
Write-Host ""
Write-Host "Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✓ .env file already exists" -ForegroundColor Green
    $response = Read-Host "Do you want to overwrite it with .env.example? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Copy-Item ".env.example" ".env" -Force
        Write-Host "✓ .env file updated from .env.example" -ForegroundColor Green
    }
} else {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Created .env file from .env.example" -ForegroundColor Green
}

# Check if backend .env exists
if (Test-Path "backend\.env") {
    Write-Host "✓ backend/.env file already exists" -ForegroundColor Green
} else {
    if (Test-Path "backend\.env.example") {
        Copy-Item "backend\.env.example" "backend\.env"
        Write-Host "✓ Created backend/.env from backend/.env.example" -ForegroundColor Green
    }
}

# Ask which mode to run
Write-Host ""
Write-Host "Choose deployment mode:" -ForegroundColor Yellow
Write-Host "1. Development (with hot reload)"
Write-Host "2. Production"
Write-Host "3. Exit"
$mode = Read-Host "Enter your choice (1-3)"

switch ($mode) {
    "1" {
        Write-Host ""
        Write-Host "🔨 Building and starting services in DEVELOPMENT mode..." -ForegroundColor Cyan
        docker-compose -f docker-compose.dev.yml up --build -d
        
        Write-Host ""
        Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
        
        Write-Host ""
        Write-Host "📊 Service status:" -ForegroundColor Cyan
        docker-compose -f docker-compose.dev.yml ps
        
        Write-Host ""
        Write-Host "✅ Setup complete! Services are running:" -ForegroundColor Green
        Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
        Write-Host "   Backend:   http://localhost:8000" -ForegroundColor White
        Write-Host "   API Docs:  http://localhost:8000/docs" -ForegroundColor White
        Write-Host ""
        Write-Host "Useful commands:" -ForegroundColor Yellow
        Write-Host "   View logs:     docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor White
        Write-Host "   Stop services: docker-compose -f docker-compose.dev.yml down" -ForegroundColor White
        Write-Host "   Restart:       docker-compose -f docker-compose.dev.yml restart" -ForegroundColor White
    }
    "2" {
        Write-Host ""
        Write-Host "🔨 Building and starting services in PRODUCTION mode..." -ForegroundColor Cyan
        docker-compose up --build -d
        
        Write-Host ""
        Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 20
        
        Write-Host ""
        Write-Host "📊 Service status:" -ForegroundColor Cyan
        docker-compose ps
        
        Write-Host ""
        Write-Host "✅ Setup complete! Services are running:" -ForegroundColor Green
        Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
        Write-Host "   Backend:   http://localhost:8000" -ForegroundColor White
        Write-Host "   API Docs:  http://localhost:8000/docs" -ForegroundColor White
        Write-Host ""
        Write-Host "Useful commands:" -ForegroundColor Yellow
        Write-Host "   View logs:     docker-compose logs -f" -ForegroundColor White
        Write-Host "   Stop services: docker-compose down" -ForegroundColor White
        Write-Host "   Restart:       docker-compose restart" -ForegroundColor White
    }
    "3" {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Invalid choice. Setup cancelled." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📖 For more information, see CONTAINERIZATION.md" -ForegroundColor Cyan
