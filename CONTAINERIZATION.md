# Containerization Guide

This guide explains how to run the collect-anything-app using Docker and Docker Compose.

## Overview

The application consists of three services:
- **Frontend**: Next.js application (Port 3000)
- **Backend**: FastAPI application with UV package manager (Port 8000)
- **Database**: PostgreSQL 16 (Port 5432)

## Prerequisites

- Docker Desktop or Docker Engine 20.10+
- Docker Compose V2

## Quick Start

### Development Mode (with hot reload)

For development with hot reload on code changes:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

This will:
- Mount source code directories for hot reload
- Enable auto-restart on file changes
- Use development build configurations

### Production Mode

For production-optimized builds:

```bash
docker-compose up --build
```

This will:
- Build optimized production images
- Use standalone Next.js output
- Run without development dependencies

## Accessing Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432 (accessible with credentials from compose file)

## Environment Configuration

Copy `.env.example` to `.env` and customize as needed:

```bash
cp .env.example .env
```

Key environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Backend JWT secret (change in production!)
- `NEXT_PUBLIC_API_URL`: Backend API URL for frontend

## Docker Files

### Backend

- **Dockerfile**: Production build using UV package manager
- **pyproject.toml**: Python dependencies managed by UV
- Uses Python 3.13 slim base image
- Installs packages with `uv sync --frozen` for reproducible builds

### Frontend

- **Dockerfile**: Multi-stage production build with standalone output
- **Dockerfile.dev**: Development build with hot reload
- Uses Node.js 22 Alpine base image
- Optimized for minimal image size

### Docker Compose

- **docker-compose.yml**: Production configuration
- **docker-compose.dev.yml**: Development configuration with volume mounts

## Common Commands

### Start services
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
docker-compose logs -f backend  # specific service
```

### Stop services
```bash
docker-compose down
```

### Rebuild specific service
```bash
docker-compose up -d --build backend
```

### Run backend migrations
```bash
docker-compose exec backend uv run alembic upgrade head
```

### Access database
```bash
docker-compose exec db psql -U collectapp -d collectapp
```

### Clean up volumes (⚠️ destroys data)
```bash
docker-compose down -v
```

## Backend UV Package Management

The backend uses [UV](https://github.com/astral-sh/uv) for fast, reliable Python package management:

- Dependencies are defined in `backend/pyproject.toml`
- UV creates a `.venv` virtual environment automatically
- All Python commands run via `uv run` to use the correct environment
- Lockfile-free by default; use `uv lock` if you need reproducible builds

### Adding Backend Dependencies

To add a package to the backend:

1. Add it to `backend/pyproject.toml` dependencies
2. Rebuild the backend container: `docker-compose up -d --build backend`

Or run inside the container:
```bash
docker-compose exec backend uv add <package-name>
```

## Troubleshooting

### Port conflicts
If ports 3000, 8000, or 5432 are already in use, modify the port mappings in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change external port
```

### Database connection issues
Ensure the `db` service is healthy before backend starts. The compose file includes health checks.

### Frontend can't reach backend
Verify `NEXT_PUBLIC_API_URL` in the frontend environment matches the backend service URL.

### Permission issues on Windows
If you encounter volume mounting issues, ensure Docker Desktop has access to the project directory in Settings > Resources > File Sharing.

## Production Deployment

For production:

1. Change all default passwords and secrets
2. Use environment variables or secrets management
3. Set `SECRET_KEY` to a strong random value
4. Consider using external managed PostgreSQL
5. Set up proper backup strategies for database volumes
6. Use reverse proxy (nginx/traefik) for HTTPS
7. Implement proper logging and monitoring

## Notes

- The backend uses UV for fast, modern Python dependency management
- Frontend uses Next.js standalone output for minimal Docker image size
- Database data persists in Docker volumes between restarts
- Development mode mounts source code for instant file change detection
