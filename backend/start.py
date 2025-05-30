#!/usr/bin/env python3
"""
Start script for EverKind Therapeutic API.
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import uvicorn
from api.config import settings

if __name__ == "__main__":
    print("🚀 Starting EverKind Therapeutic API...")
    print(f"🌍 Environment: {settings.ENVIRONMENT}")
    print(f"📡 Host: {settings.HOST}:{settings.PORT}")
    print(f"📚 Docs: http://{settings.HOST}:{settings.PORT}/docs")
    
    uvicorn.run(
        "main:app",  # Import string instead of app object
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.is_development,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True
    ) 