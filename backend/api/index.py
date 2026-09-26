import sys
from pathlib import Path

# Add backend and backend/src to Python module search path for Vercel Serverless Function
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))
sys.path.insert(0, str(ROOT_DIR / "src"))

from src.app.main import app

# Expose app for Vercel ASGI runtime
__all__ = ["app"]
