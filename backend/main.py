from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load .env BEFORE importing modules that read environment variables
load_dotenv()

from database import create_db_and_tables
from routers import auth
from routers import forms
from routers import projects
from routers import views

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

# Get allowed origins from environment variable
# Default to common development origins if not specified
allowed_origins_str = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3002"
)
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(forms.router, prefix="/api")
app.include_router(forms.forms_router, prefix="/api")
app.include_router(projects.router, prefix="/api")
app.include_router(views.router, prefix="/api")

@app.get("/")
def read_root():
    return {"Hello": "World"}
