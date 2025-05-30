"""
Pydantic models for API requests and responses.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ChatMessage(BaseModel):
    """
    Represents a chat message.
    
    Args:
        role (str): The role of the message sender ('user' or 'assistant')
        content (str): The content of the message
        timestamp (datetime): When the message was created
    """
    role: str = Field(..., description="Role of the message sender")
    content: str = Field(..., description="Content of the message")
    timestamp: datetime = Field(default_factory=datetime.now, description="Message timestamp")


class ChatRequest(BaseModel):
    """
    Request model for chat endpoint.
    
    Args:
        message (str): The user's message
        conversation_history (List[ChatMessage]): Previous messages in the conversation
        user_mood (str): Current user mood (optional)
    """
    message: str = Field(..., min_length=1, max_length=2000, description="User's message")
    conversation_history: List[ChatMessage] = Field(default_factory=list, description="Previous conversation")
    user_mood: Optional[str] = Field(None, description="User's current mood")


class ChatResponse(BaseModel):
    """
    Response model for chat endpoint.
    
    Returns:
        response (str): The AI therapist's response
        conversation_id (str): Unique conversation identifier
        timestamp (datetime): Response timestamp
    """
    response: str = Field(..., description="AI therapist response")
    conversation_id: str = Field(..., description="Conversation identifier")
    timestamp: datetime = Field(default_factory=datetime.now, description="Response timestamp")


class HealthResponse(BaseModel):
    """
    Health check response model.
    
    Returns:
        status (str): Service status
        timestamp (datetime): Check timestamp
        version (str): API version
    """
    status: str = Field(..., description="Service status")
    timestamp: datetime = Field(default_factory=datetime.now, description="Check timestamp")
    version: str = Field(..., description="API version")


class ErrorResponse(BaseModel):
    """
    Error response model.
    
    Returns:
        error (str): Error message
        detail (str): Detailed error description
        timestamp (datetime): Error timestamp
    """
    error: str = Field(..., description="Error message")
    detail: str = Field(..., description="Detailed error description")
    timestamp: datetime = Field(default_factory=datetime.now, description="Error timestamp") 