"""
API routes for the EverKind therapeutic chat application.
"""

import logging
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from .models import ChatRequest, ChatResponse, HealthResponse, ErrorResponse
from .chat_service import chat_service
from .config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Send a message to the AI therapist",
    description="Send a message and receive a therapeutic response using CBT techniques"
)
async def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """
    Send a message to the AI therapist and receive a therapeutic response.
    
    Args:
        request (ChatRequest): The chat request containing message and context
        
    Returns:
        ChatResponse: The AI therapist's response
        
    Raises:
        HTTPException: If there's an error processing the request
    """
    try:
        logger.info(f"Received chat request: {request.message[:50]}...")
        
        # Validate API key is configured
        if not settings.OPENAI_API_KEY:
            logger.error("OpenAI API key not configured")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="AI service not configured. Please contact support."
            )
        
        # Get therapeutic response
        response = await chat_service.get_therapeutic_response(request)
        
        logger.info(f"Successfully generated response for conversation {response.conversation_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later."
        )


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check endpoint",
    description="Check the health status of the API service"
)
async def health_check() -> HealthResponse:
    """
    Health check endpoint to verify API service status.
    
    Returns:
        HealthResponse: Current service health status
    """
    try:
        # Basic health check - verify OpenAI key is configured
        api_key_configured = bool(settings.OPENAI_API_KEY)
        
        if not api_key_configured:
            logger.warning("Health check failed: OpenAI API key not configured")
            return HealthResponse(
                status="unhealthy",
                version=settings.API_VERSION
            )
        
        logger.info("Health check passed")
        return HealthResponse(
            status="healthy",
            version=settings.API_VERSION
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return HealthResponse(
            status="unhealthy",
            version=settings.API_VERSION
        )


@router.get(
    "/conversation/{conversation_id}",
    summary="Get conversation history",
    description="Retrieve the history of a specific conversation"
)
async def get_conversation(conversation_id: str) -> JSONResponse:
    """
    Get conversation history by conversation ID.
    
    Args:
        conversation_id (str): The conversation identifier
        
    Returns:
        JSONResponse: Conversation history or error message
    """
    try:
        history = chat_service.get_conversation_history(conversation_id)
        
        if history is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        return JSONResponse({
            "conversation_id": conversation_id,
            "messages": history
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving conversation {conversation_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving conversation history"
        )


@router.get(
    "/",
    summary="API root endpoint",
    description="Get basic API information"
)
async def root() -> JSONResponse:
    """
    Root endpoint with basic API information.
    
    Returns:
        JSONResponse: API information
    """
    return JSONResponse({
        "name": settings.API_TITLE,
        "description": settings.API_DESCRIPTION,
        "version": settings.API_VERSION,
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    })


# Add a route for the absolute root path as well
@router.get(
    "",
    summary="API root endpoint (alternative)",
    description="Get basic API information"
)
async def root_alt() -> JSONResponse:
    """Alternative root endpoint."""
    return await root() 