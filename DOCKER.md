# Docker Quick Reference

## Start the application

**Development (with hot reload):**
```powershell
docker-compose -f docker-compose.dev.yml up --build
```

**Production:**
```powershell
docker-compose up --build
```

## Access the application
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Common commands

```powershell
# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Run migrations
docker-compose exec backend uv run alembic upgrade head

# Access database
docker-compose exec db psql -U collectapp -d collectapp

# Rebuild a specific service
docker-compose up -d --build backend
```

See [CONTAINERIZATION.md](CONTAINERIZATION.md) for complete documentation.
