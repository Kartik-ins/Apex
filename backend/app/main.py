"""FastAPI entrypoint for Apex AI-Powered Fitness & Nutrition Coach."""

import os
from contextlib import asynccontextmanager
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import CheckinRequest, CoachResponse

load_dotenv()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Application startup and shutdown hooks."""
    yield


app = FastAPI(
    title="Apex AI Fitness & Nutrition Coach",
    description="High-performance coach for busy executives using LangGraph and OpenRouter",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS setup: Configured with local dev, production Netlify frontend, and env overrides
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://apexfront.netlify.app",
]

# Add frontend domain from environment if provided (e.g. Netlify URL)
for env_key in ("FRONTEND_URL", "ALLOWED_ORIGINS"):
    val = os.getenv(env_key)
    if val:
        for url in val.split(","):
            url = url.strip().rstrip("/")
            if url and url not in origins:
                origins.append(url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https:\/\/([a-zA-Z0-9_-]+\.)*netlify\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", summary="Root Endpoint")
async def root() -> dict[str, Any]:
    """Root endpoint to verify deployment in browser."""
    return {
        "service": "Apex AI Coach API",
        "status": "online",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health", summary="Health Check")
async def health_check() -> dict[str, Any]:
    """Check service health and configuration status."""
    has_api_key = bool(os.getenv("OPENROUTER_API_KEY"))
    model = os.getenv("OPENROUTER_MODEL", "openrouter/free")

    return {
        "status": "healthy",
        "service": "Apex AI Coach",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "openrouter_configured": has_api_key,
        "model": model,
    }


@app.get("/api/pantry-staples", summary="Curated Pantry Staples")
async def get_pantry_staples() -> dict[str, list[str]]:
    """Return categorized staple pantry items for frontend quick-selection."""
    return {
        "Proteins & Dairy": [
            "chicken breast",
            "eggs",
            "paneer",
            "soya chunks",
            "curd (dahi)",
            "fish fillet",
            "tofu",
            "moong dal",
            "chana dal",
            "chickpeas (chole)",
            "rajma (kidney beans)",
            "kala chana",
            "sprouted moong",
            "whey protein",
        ],
        "Carbohydrates & Grains": [
            "basmati rice",
            "brown rice",
            "rolled oats",
            "poha",
            "dalia (broken wheat)",
            "besan (gram flour)",
            "whole wheat atta",
            "quinoa",
            "ragi (finger millet)",
            "suji (semolina)",
        ],
        "Produce & Greens": [
            "palak (spinach)",
            "methi (fenugreek)",
            "tomato",
            "onion",
            "capsicum (bell pepper)",
            "green peas (matar)",
            "ginger & garlic",
            "green chilies",
            "fresh coriander (dhaniya)",
            "cucumber",
            "lemon",
        ],
        "Fats, Nuts & Essentials": [
            "ghee",
            "mustard oil",
            "olive oil",
            "roasted peanuts",
            "almonds",
            "walnuts",
            "chia seeds",
            "jeera (cumin seeds)",
            "turmeric (haldi)",
            "garam masala",
        ],
    }


@app.post(
    "/api/checkin",
    response_model=CoachResponse,
    status_code=status.HTTP_200_OK,
    summary="Process Daily Executive Check-in",
)
async def process_checkin(request: CheckinRequest) -> CoachResponse:
    """Process user check-in through the LangGraph AI coach workflow."""
    try:
        from app.graph import run_coach_workflow

        response = await run_coach_workflow(request)
        return response
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing AI coach workflow: {exc!s}",
        ) from exc
