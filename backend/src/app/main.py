import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .api.streaks import router as streaks_router

app = FastAPI(
    title="Dracarys 🐉🔥 - Habit Staking & Verification Engine (Monad)",
    description=(
        "Backend verification engine and real-time social feed for Dracarys micro-habit staking on Monad. "
        "Upload gym/step/reading proofs, participate in peer consensus, stream sub-second micro-payouts, "
        "and enforce 24-hour cutoffs with automated slacker burning."
    ),
    version="1.0.0"
)

# Enable CORS for local Next.js frontend and mobile testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded proof images statically
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include Streaks router
app.include_router(streaks_router)


@app.get("/")
def root():
    return {
        "project": "Dracarys 🐉🔥",
        "chain": "Monad Testnet (Chain ID 10143)",
        "status": "Online",
        "docs_url": "/docs",
        "message": "Kindle your flame or get burned."
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "engine": "FastAPI + Monad Sub-second Streamer",
        "network": {
            "name": "Monad Testnet",
            "chain_id": 10143,
            "block_time": "0.4s",
            "finality": "800ms"
        }
    }
