"""
Main FastAPI application for EverKind therapeutic chat API.
"""

import logging
import time
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from api.config import settings
from api.routes import router
from api.models import ErrorResponse


# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for startup and shutdown events.
    
    Args:
        app (FastAPI): The FastAPI application instance
    """
    # Startup
    logger.info("Starting EverKind Therapeutic API...")
    
    try:
        # Validate configuration
        settings.validate_settings()
        logger.info("✅ Configuration validated successfully")
        
        # Log startup information
        logger.info(f"🚀 API Version: {settings.API_VERSION}")
        logger.info(f"🌍 Environment: {settings.ENVIRONMENT}")
        logger.info(f"🔧 OpenAI Model: {settings.OPENAI_MODEL}")
        logger.info(f"📡 CORS Origins: {settings.ALLOWED_ORIGINS}")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {str(e)}")
        raise
    
    # Shutdown
    logger.info("Shutting down EverKind Therapeutic API...")


# Create FastAPI application
app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Add trusted host middleware for production
if settings.is_production:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["everkind-demo.15rock.com", "localhost"]
    )


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Log all HTTP requests for monitoring and debugging.
    
    Args:
        request (Request): The incoming request
        call_next: The next middleware or route handler
        
    Returns:
        Response: The response from the next handler
    """
    start_time = time.time()
    
    # Log request
    logger.info(f"📨 {request.method} {request.url.path} - Client: {request.client.host}")
    
    # Process request
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    logger.info(f"📤 {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.3f}s")
    
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Global exception handler for unhandled errors.
    
    Args:
        request (Request): The request that caused the error
        exc (Exception): The exception that was raised
        
    Returns:
        JSONResponse: Error response
    """
    logger.error(f"🚨 Unhandled exception: {str(exc)}", exc_info=True)
    
    error_response = ErrorResponse(
        error="Internal Server Error",
        detail="An unexpected error occurred. Please try again later."
    )
    
    return JSONResponse(
        status_code=500,
        content=error_response.model_dump()
    )


# Include API routes
app.include_router(router, prefix="/api/v1")


# Root endpoint at the app level
@app.get("/")
async def app_root():
    """Root endpoint for the application."""
    return {
        "name": settings.API_TITLE,
        "description": settings.API_DESCRIPTION,
        "version": settings.API_VERSION,
        "status": "running",
        "endpoints": {
            "chat": "/api/v1/chat",
            "health": "/api/v1/health",
            "docs": "/docs",
            "root_health": "/health"
        },
        "message": "Welcome to EverKind Therapeutic API! Visit /docs for interactive documentation."
    }


# Health check endpoint at root level
@app.get("/health")
async def root_health_check():
    """Root level health check for load balancers."""
    return {"status": "healthy", "service": "everkind-api"}


if __name__ == "__main__":
    """Run the application with uvicorn when executed directly."""
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.is_development,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True
    ) 