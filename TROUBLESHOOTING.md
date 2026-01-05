# Docker Troubleshooting Guide

Common issues and solutions when running the containerized app.

## Table of Contents
- [Installation Issues](#installation-issues)
- [Build Issues](#build-issues)
- [Runtime Issues](#runtime-issues)
- [Database Issues](#database-issues)
- [Network Issues](#network-issues)
- [Performance Issues](#performance-issues)

## Installation Issues

### Docker not found
**Problem:** `docker: command not found`

**Solution:**
1. Install Docker Desktop from https://www.docker.com/products/docker-desktop
2. Ensure Docker is running (check system tray/menu bar)
3. Restart your terminal after installation

### Docker Compose not available
**Problem:** `docker-compose: command not found`

**Solution:**
- Docker Desktop includes Docker Compose V2
- Use `docker compose` (without hyphen) instead of `docker-compose`
- Or install standalone: https://docs.docker.com/compose/install/

## Build Issues

### UV sync fails in backend
**Problem:** `ERROR: Could not install packages due to an EnvironmentError`

**Solution:**
```powershell
# Clear Docker build cache
docker builder prune -a

# Rebuild without cache
docker-compose build --no-cache backend
```

### Frontend build out of memory
**Problem:** `JavaScript heap out of memory`

**Solution:**
Update [frontend/Dockerfile](frontend/Dockerfile) build stage:
```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build
```

### Python version mismatch
**Problem:** `requires python >=3.13 but the running Python is 3.12`

**Solution:**
Ensure [backend/Dockerfile](backend/Dockerfile) uses correct base image:
```dockerfile
FROM python:3.13-slim
```

## Runtime Issues

### Services won't start
**Problem:** `Cannot start service backend: driver failed`

**Solution:**
```powershell
# Check Docker daemon is running
docker info

# Restart Docker Desktop
# Then clean up and restart services
docker-compose down -v
docker-compose up --build
```

### Backend crashes immediately
**Problem:** Backend container exits with code 1

**Solution:**
```powershell
# Check logs for errors
docker-compose logs backend

# Common issues:
# 1. DATABASE_URL not set - check .env file
# 2. Database not ready - ensure db health check passes
# 3. Port conflict - change port in docker-compose.yml
```

### Frontend 404 errors
**Problem:** Next.js shows 404 for all routes

**Solution:**
1. Check if standalone build is enabled in [next.config.ts](frontend/next.config.ts):
   ```typescript
   output: 'standalone'
   ```
2. Rebuild frontend: `docker-compose up -d --build frontend`

### Container stuck in "starting" state
**Problem:** Service health check failing

**Solution:**
```powershell
# Check health status
docker-compose ps

# View health check logs
docker inspect <container_id> | grep -A 10 Health

# Increase health check timeout in docker-compose.yml:
healthcheck:
  timeout: 30s
  start_period: 60s
```

## Database Issues

### Database connection refused
**Problem:** `could not connect to server: Connection refused`

**Solution:**
```powershell
# 1. Check if db container is running
docker-compose ps db

# 2. Check db health
docker-compose exec db pg_isready -U collectapp

# 3. Verify DATABASE_URL uses 'db' as hostname (not 'localhost')
# In docker-compose: db:5432
# For local dev outside Docker: localhost:5432
```

### Database already exists error
**Problem:** `database "collectapp" already exists`

**Solution:**
```powershell
# This is usually not an error, but if you need a fresh database:
docker-compose down -v  # ⚠️  This deletes all data!
docker-compose up -d
```

### Migration errors
**Problem:** `alembic.util.exc.CommandError: Can't locate revision identified by`

**Solution:**
```powershell
# 1. Check migration history
docker-compose exec backend uv run alembic history

# 2. Reset to base (⚠️  destroys data)
docker-compose exec backend uv run alembic downgrade base

# 3. Re-apply migrations
docker-compose exec backend uv run alembic upgrade head
```

### Permission denied on database files
**Problem:** `ERROR: permission denied for table`

**Solution:**
```powershell
# Reset database with correct permissions
docker-compose down -v
docker volume rm collect-anything-app_postgres_data
docker-compose up -d db
```

## Network Issues

### Port already in use
**Problem:** `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution:**

**Option 1 - Stop conflicting process:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000
# Kill the process
taskkill /PID <pid> /F
```

**Option 2 - Change port in docker-compose.yml:**
```yaml
services:
  frontend:
    ports:
      - "3001:3000"  # External:Internal
```

### Frontend can't reach backend
**Problem:** `fetch failed` or `ERR_CONNECTION_REFUSED`

**Solution:**
1. Check NEXT_PUBLIC_API_URL in docker-compose.yml
2. From frontend container, use service name: `http://backend:8000`
3. From browser, use: `http://localhost:8000`

### CORS errors in browser
**Problem:** `Access-Control-Allow-Origin header`

**Solution:**
Update [backend/main.py](backend/main.py):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Performance Issues

### Slow build times
**Problem:** Docker builds take too long

**Solution:**
```powershell
# 1. Use Docker build cache
docker-compose build

# 2. Enable BuildKit for faster builds
$env:DOCKER_BUILDKIT=1
docker-compose build

# 3. Use .dockerignore to exclude unnecessary files
# Already configured in .dockerignore files
```

### High memory usage
**Problem:** Docker consuming too much RAM

**Solution:**
1. Open Docker Desktop Settings
2. Resources → Adjust memory limit (4-6GB recommended)
3. Restart Docker Desktop

### Slow hot reload in dev mode
**Problem:** File changes take long to reflect

**Solution:**
```powershell
# Windows: Ensure volume mounts are on C: drive
# Use docker-compose.dev.yml for development
docker-compose -f docker-compose.dev.yml up
```

## Windows-Specific Issues

### WSL 2 integration required
**Problem:** `Error response from daemon: open \\.\pipe\docker_engine: The system cannot find the file specified`

**Solution:**
1. Open Docker Desktop Settings
2. Enable "Use WSL 2 based engine"
3. Restart Docker Desktop

### File permission issues
**Problem:** Files created by container have wrong permissions

**Solution:**
Add to docker-compose.yml:
```yaml
services:
  backend:
    user: "${UID}:${GID}"  # Unix only
```

For Windows, this is typically not an issue due to how WSL handles permissions.

### Path conversion issues
**Problem:** Volume mounts fail with invalid path

**Solution:**
Use absolute paths in docker-compose.yml:
```yaml
volumes:
  - ./backend:/app  # Relative paths work on Windows
```

## Getting More Help

If your issue isn't listed here:

1. **Check logs:**
   ```powershell
   docker-compose logs -f
   docker-compose logs backend
   docker-compose logs frontend
   docker-compose logs db
   ```

2. **Inspect container:**
   ```powershell
   docker-compose exec backend /bin/sh
   ```

3. **Clean slate (⚠️  destroys all data):**
   ```powershell
   docker-compose down -v
   docker system prune -a
   docker-compose up --build
   ```

4. **Check resources:**
   ```powershell
   docker stats
   docker system df
   ```

5. **Review documentation:**
   - [CONTAINERIZATION.md](CONTAINERIZATION.md)
   - [README.md](README.md)
   - [PRD.md](PRD.md)

## Still Having Issues?

Create an issue with:
- Output of `docker version` and `docker-compose version`
- Full error message and logs
- Steps to reproduce
- Your OS and Docker Desktop version
