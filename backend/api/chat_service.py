"""
Chat service for handling therapeutic conversations with OpenAI.
"""

import logging
import uuid
from typing import List, Optional
from openai import OpenAI
from .config import settings
from .models import ChatMessage, ChatRequest, ChatResponse

# Configure logging
logger = logging.getLogger(__name__)


class ChatService:
    """
    Service for handling therapeutic chat conversations using OpenAI.
    """
    
    def __init__(self):
        """Initialize the chat service with OpenAI client."""
        self.client = None
        if settings.OPENAI_API_KEY:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.conversation_sessions = {}  # In-memory storage for demo
    
    def _build_system_message(self, user_mood: Optional[str] = None) -> str:
        """
        Build the system message with optional mood context.
        
        Args:
            user_mood (str): The user's current mood
            
        Returns:
            str: Complete system message for the AI
        """
        base_prompt = settings.THERAPIST_SYSTEM_PROMPT
        
        if user_mood:
            mood_context = f"\n\nCurrent user mood: {user_mood}. Please acknowledge their emotional state and respond with appropriate therapeutic support."
            return base_prompt + mood_context
        
        return base_prompt
    
    def _prepare_messages(self, request: ChatRequest) -> List[dict]:
        """
        Prepare messages for OpenAI API format.
        
        Args:
            request (ChatRequest): The chat request
            
        Returns:
            List[dict]: Messages formatted for OpenAI API
        """
        messages = [
            {
                "role": "system",
                "content": self._build_system_message(request.user_mood)
            }
        ]
        
        # Add conversation history
        for msg in request.conversation_history:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": request.message
        })
        
        return messages
    
    async def get_therapeutic_response(self, request: ChatRequest) -> ChatResponse:
        """
        Get therapeutic response from OpenAI.
        
        Args:
            request (ChatRequest): The chat request
            
        Returns:
            ChatResponse: The AI therapist's response
            
        Raises:
            Exception: If OpenAI API call fails
        """
        try:
            # Generate conversation ID
            conversation_id = str(uuid.uuid4())
            
            # Check if OpenAI client is available
            if not self.client:
                logger.warning("OpenAI client not initialized - using fallback response")
                fallback_response = self._get_fallback_response(request.user_mood)
                return ChatResponse(
                    response=fallback_response,
                    conversation_id=conversation_id
                )
            
            # Prepare messages for OpenAI
            messages = self._prepare_messages(request)
            
            logger.info(f"Sending request to OpenAI for conversation {conversation_id}")
            
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=messages,
                max_tokens=settings.OPENAI_MAX_TOKENS,
                temperature=settings.OPENAI_TEMPERATURE,
                presence_penalty=0.1,  # Slight penalty to avoid repetition
                frequency_penalty=0.1   # Slight penalty for repetitive phrases
            )
            
            # Extract the response content
            ai_response = response.choices[0].message.content
            
            logger.info(f"Received response from OpenAI for conversation {conversation_id}")
            
            # Store conversation in memory (for demo purposes)
            self.conversation_sessions[conversation_id] = {
                "messages": messages,
                "last_response": ai_response
            }
            
            return ChatResponse(
                response=ai_response,
                conversation_id=conversation_id
            )
            
        except Exception as e:
            logger.error(f"Error getting therapeutic response: {str(e)}")
            
            # Return a fallback response for production resilience
            fallback_response = self._get_fallback_response(request.user_mood)
            
            return ChatResponse(
                response=fallback_response,
                conversation_id=str(uuid.uuid4())
            )
    
    def _get_fallback_response(self, user_mood: Optional[str] = None) -> str:
        """
        Get a fallback response when OpenAI is unavailable.
        
        Args:
            user_mood (str): The user's current mood
            
        Returns:
            str: Fallback therapeutic response
        """
        base_response = ("I'm here to support you, though I'm experiencing some technical "
                        "difficulties right now. Your feelings are valid and important. ")
        
        if user_mood:
            mood_responses = {
                "stressed": "When feeling stressed, try taking three deep breaths and focusing on what you can control right now.",
                "overwhelmed": "Feeling overwhelmed is tough. Consider breaking down your challenges into smaller, manageable steps.",
                "depressed": "Depression can feel isolating, but you're not alone. Small steps forward are still progress.",
                "anxious": "Anxiety can be challenging. Try grounding yourself by noticing 5 things you can see around you."
            }
            
            mood_specific = mood_responses.get(user_mood.lower(), 
                                             "Whatever you're feeling right now is understandable.")
            return base_response + mood_specific
        
        return base_response + "How are you feeling right now?"
    
    def get_conversation_history(self, conversation_id: str) -> Optional[List[dict]]:
        """
        Retrieve conversation history by ID.
        
        Args:
            conversation_id (str): The conversation identifier
            
        Returns:
            Optional[List[dict]]: Conversation messages or None if not found
        """
        session = self.conversation_sessions.get(conversation_id)
        return session["messages"] if session else None


# Global chat service instance
chat_service = ChatService() 