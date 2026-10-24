"""
AI-Powered Multimodal Construction Intelligence Platform
FastAPI Backend - Main Application Entry Point
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from routers import (
    safety,
    crack_detection,
    valuation,
    planning,
    site_assistance,
    weather,
    knowledge
)

app = FastAPI(
    title="Construction Intelligence Platform API",
    description="AI-Powered Multimodal Construction Intelligence Platform powered by Google Gemini",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all feature routers
app.include_router(safety.router, prefix="/api/safety", tags=["Safety Monitoring"])
app.include_router(crack_detection.router, prefix="/api/crack", tags=["Crack Detection"])
app.include_router(valuation.router, prefix="/api/valuation", tags=["Real Estate Valuation"])
app.include_router(planning.router, prefix="/api/planning", tags=["Project Planning"])
app.include_router(site_assistance.router, prefix="/api/assistance", tags=["Site Assistance"])
app.include_router(weather.router, prefix="/api/weather", tags=["Weather Advisory"])
app.include_router(knowledge.router, prefix="/api/knowledge", tags=["Knowledge Assistant"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "platform": "AI-Powered Multimodal Construction Intelligence Platform",
        "version": "1.0.0",
        "endpoints": [
            "/api/safety",
            "/api/crack",
            "/api/valuation",
            "/api/planning",
            "/api/assistance",
            "/api/weather",
            "/api/knowledge",
        ]
    }


@app.get("/health", tags=["Health"])
async def health_check():
    api_key = os.getenv("GEMINI_API_KEY", "")
    return {
        "status": "healthy",
        "gemini_configured": bool(api_key and api_key != "your_gemini_api_key_here"),
        "weather_configured": bool(os.getenv("WEATHER_API_KEY", ""))
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
