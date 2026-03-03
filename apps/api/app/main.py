"""
GitVerse AI Service — FastAPI Application
"""

import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import analyze, health

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # On Vercel, env vars are injected by the platform — dotenv is not needed


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan — startup and shutdown."""
    print("🚀 GitVerse AI Service starting...")
    yield
    print("🛑 GitVerse AI Service shutting down...")


app = FastAPI(
    title="GitVerse AI Service",
    description="AI-powered developer archetype analysis and cosmic description generation.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(health.router, tags=["Health"])
app.include_router(analyze.router, prefix="/api", tags=["Analysis"])
