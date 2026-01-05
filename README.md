# Collect Anything App

A no-code platform for teams to create data-collection projects with custom forms, validations, storage, and exports.

## 🚀 Quick Start with Docker

The fastest way to get started is using Docker:

### Automated Setup (Recommended)

```powershell
# Windows PowerShell
.\setup-docker.ps1

# Unix/Linux/macOS
chmod +x setup-docker.sh
./setup-docker.sh
```

The setup script will:
- Check Docker installation
- Create environment files
- Let you choose development or production mode
- Start all services automatically

### Manual Setup

```powershell
# Start in development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up --build

# Or start in production mode
docker-compose up --build
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

See [CONTAINERIZATION.md](CONTAINERIZATION.md) for complete Docker documentation.

## 📋 Table of Contents

- [Quick Start with Docker](#-quick-start-with-docker)
- [Local Development Setup](#-local-development-setup)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Technology Stack](#-technology-stack)

## 💻 Local Development Setup

If you prefer to run services locally without Docker:

### Prerequisites

- Python 3.13+ with [UV](https://github.com/astral-sh/uv) package manager
- Node.js 22+
- PostgreSQL 16+

### Backend Setup

```powershell
cd backend

# Install UV if not already installed
pip install uv

# Create and activate virtual environment with dependencies
uv sync

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
uv run alembic upgrade head

# Start the backend server
uv run uvicorn main:app --reload --port 8000
```

### Frontend Setup

```powershell
cd frontend

# Install dependencies
npm ci

# Start the development server
npm run dev
```

## 📁 Project Structure

```
collect-anything-app/
├── backend/                 # FastAPI backend
│   ├── main.py             # Application entry point
│   ├── models.py           # SQLModel database models
│   ├── database.py         # Database configuration
│   ├── auth_utils.py       # Authentication utilities
│   ├── routers/            # API route handlers
│   │   ├── auth.py         # Authentication endpoints
│   │   ├── projects.py     # Project management
│   │   ├── forms.py        # Form and submission handling
│   │   └── views.py        # Data views
│   ├── alembic/            # Database migrations
│   └── pyproject.toml      # Python dependencies (UV)
│
├── frontend/               # Next.js frontend
│   ├── app/                # Next.js app router
│   │   ├── page.tsx        # Landing page
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Dashboard and projects
│   │   ├── forms/          # Form rendering
│   │   └── components/     # React components
│   ├── components/         # Shared UI components
│   └── lib/                # Utilities and helpers
│
├── docs/                   # Additional documentation
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Development Docker setup
├── CONTAINERIZATION.md     # Complete Docker guide
├── PRD.md                  # Product requirements
└── README.md               # This file
```

## 📚 Documentation

- [Product Requirements (PRD.md)](PRD.md) - Product goals, features, and technical specs
- [Containerization Guide (CONTAINERIZATION.md)](CONTAINERIZATION.md) - Complete Docker setup and usage
- [Docker Quick Reference (DOCKER.md)](DOCKER.md) - Common Docker commands
- [Troubleshooting Guide (TROUBLESHOOTING.md)](TROUBLESHOOTING.md) - Solutions to common Docker issues
- [Field Types Roadmap (docs/field-types-roadmap.md)](docs/field-types-roadmap.md) - Form field type specifications
- [Backend README (backend/README.md)](backend/README.md) - Backend-specific documentation
- [Frontend README (frontend/README.md)](frontend/README.md) - Frontend-specific documentation

## 🛠 Technology Stack

### Backend
- **Framework**: FastAPI
- **ORM**: SQLModel
- **Database**: PostgreSQL 16
- **Package Manager**: UV
- **Python**: 3.13+

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database Migrations**: Alembic
- **Authentication**: JWT with python-jose

## 🚢 Deployment

### Using Docker (Recommended)

For production deployment with Docker:

1. Copy and configure environment:
   ```powershell
   cp .env.example .env
   # Edit .env with production values
   ```

2. Build and start services:
   ```powershell
   docker-compose up -d --build
   ```

3. Run migrations:
   ```powershell
   docker-compose exec backend uv run alembic upgrade head
   ```

### Manual Deployment

See individual README files in [backend/](backend/) and [frontend/](frontend/) for service-specific deployment instructions.

## 🧪 Testing

### Backend Tests
```powershell
# With Docker
docker-compose exec backend uv run pytest

# Local
cd backend
uv run pytest
```

### Frontend Tests
```powershell
cd frontend
npm run test  # when configured
```

## 🔧 Common Tasks

### Database Migrations

Create a new migration:
```powershell
docker-compose exec backend uv run alembic revision --autogenerate -m "description"
```

Apply migrations:
```powershell
docker-compose exec backend uv run alembic upgrade head
```

### Adding Dependencies

Backend (UV):
```powershell
cd backend
uv add <package-name>
# Then rebuild: docker-compose up -d --build backend
```

Frontend (npm):
```powershell
cd frontend
npm install <package-name>
# Then rebuild: docker-compose up -d --build frontend
```

### Viewing Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🤝 Contributing

1. Follow the coding conventions in [.github/copilot-instructions.md](.github/copilot-instructions.md)
2. Keep components small and focused (<300 lines)
3. Write tests for new features
4. Run migrations for database changes

## 📝 License

[Add your license here]

## 🆘 Support

For issues and questions:
- Check [CONTAINERIZATION.md](CONTAINERIZATION.md) for Docker troubleshooting
- Review [PRD.md](PRD.md) for feature specifications
- See service-specific READMEs for detailed documentation
