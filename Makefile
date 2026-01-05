# Makefile for Docker commands
# Use this for convenient shortcuts on Unix-like systems
# For Windows, use the PowerShell commands directly or run via WSL

.PHONY: help build up down logs clean dev prod migrate db-shell restart

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

dev: ## Start services in development mode with hot reload
	docker-compose -f docker-compose.dev.yml up --build

prod: ## Start services in production mode
	docker-compose up --build -d

up: ## Start services (detached)
	docker-compose up -d

down: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## View logs from all services
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

build: ## Build all Docker images
	docker-compose build

rebuild: ## Rebuild and restart all services
	docker-compose up -d --build

migrate: ## Run database migrations
	docker-compose exec backend uv run alembic upgrade head

db-shell: ## Access PostgreSQL shell
	docker-compose exec db psql -U collectapp -d collectapp

backend-shell: ## Access backend container shell
	docker-compose exec backend /bin/sh

frontend-shell: ## Access frontend container shell
	docker-compose exec frontend /bin/sh

clean: ## Stop services and remove volumes (⚠️  destroys data)
	docker-compose down -v

clean-all: ## Remove all containers, volumes, and images
	docker-compose down -v --rmi all

ps: ## Show running containers
	docker-compose ps

test-backend: ## Run backend tests
	docker-compose exec backend uv run pytest
