"""
Unit tests for the chat service functionality.
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from api.chat_service import ChatService
from api.models import ChatRequest, ChatMessage, ChatResponse
from api.config import settings


class TestChatService:
    """Test cases for ChatService class."""
    
    @pytest.fixture
    def chat_service(self):
        """Create a ChatService instance for testing."""
        return ChatService()
    
    @pytest.fixture
    def sample_chat_request(self):
        """Create a sample chat request for testing."""
        return ChatRequest(
            message="I'm feeling really stressed about work",
            conversation_history=[
                ChatMessage(role="user", content="Hello"),
                ChatMessage(role="assistant", content="Hi there! How are you feeling today?")
            ],
            user_mood="stressed"
        )
    
    def test_build_system_message_without_mood(self, chat_service):
        """Test building system message without mood context."""
        message = chat_service._build_system_message()
        
        assert settings.THERAPIST_SYSTEM_PROMPT in message
        assert "Current user mood:" not in message
    
    def test_build_system_message_with_mood(self, chat_service):
        """Test building system message with mood context."""
        mood = "anxious"
        message = chat_service._build_system_message(mood)
        
        assert settings.THERAPIST_SYSTEM_PROMPT in message
        assert f"Current user mood: {mood}" in message
        assert "appropriate therapeutic support" in message
    
    def test_prepare_messages(self, chat_service, sample_chat_request):
        """Test preparing messages for OpenAI API format."""
        messages = chat_service._prepare_messages(sample_chat_request)
        
        # Should have system message + conversation history + current message
        assert len(messages) == 4
        
        # First message should be system message
        assert messages[0]["role"] == "system"
        assert "stressed" in messages[0]["content"]
        
        # History should be preserved
        assert messages[1]["role"] == "user"
        assert messages[1]["content"] == "Hello"
        assert messages[2]["role"] == "assistant"
        assert messages[2]["content"] == "Hi there! How are you feeling today?"
        
        # Current message should be last
        assert messages[3]["role"] == "user"
        assert messages[3]["content"] == sample_chat_request.message
    
    @pytest.mark.asyncio
    @patch('api.chat_service.OpenAI')
    async def test_get_therapeutic_response_success(self, mock_openai, chat_service, sample_chat_request):
        """Test successful therapeutic response generation."""
        # Mock OpenAI response
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = "I understand work stress can be overwhelming. Let's explore what's causing this feeling."
        
        mock_client = Mock()
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client
        
        # Initialize service with mocked client
        chat_service.client = mock_client
        
        response = await chat_service.get_therapeutic_response(sample_chat_request)
        
        assert isinstance(response, ChatResponse)
        assert "stress" in response.response.lower()
        assert response.conversation_id is not None
        assert mock_client.chat.completions.create.called
    
    @pytest.mark.asyncio
    @patch('api.chat_service.OpenAI')
    async def test_get_therapeutic_response_failure(self, mock_openai, chat_service, sample_chat_request):
        """Test therapeutic response when OpenAI fails."""
        # Mock OpenAI to raise an exception
        mock_client = Mock()
        mock_client.chat.completions.create.side_effect = Exception("API Error")
        mock_openai.return_value = mock_client
        
        chat_service.client = mock_client
        
        response = await chat_service.get_therapeutic_response(sample_chat_request)
        
        # Should return fallback response
        assert isinstance(response, ChatResponse)
        assert "technical difficulties" in response.response
        assert "stressed" in response.response  # Should include mood-specific response
        assert response.conversation_id is not None
    
    def test_get_fallback_response_without_mood(self, chat_service):
        """Test fallback response without mood context."""
        response = chat_service._get_fallback_response()
        
        assert "technical difficulties" in response
        assert "feelings are valid" in response
        assert "How are you feeling" in response
    
    def test_get_fallback_response_with_mood(self, chat_service):
        """Test fallback response with mood context."""
        mood = "anxious"
        response = chat_service._get_fallback_response(mood)
        
        assert "technical difficulties" in response
        assert "grounding yourself" in response
        assert "5 things you can see" in response
    
    def test_get_fallback_response_unknown_mood(self, chat_service):
        """Test fallback response with unknown mood."""
        mood = "confused"
        response = chat_service._get_fallback_response(mood)
        
        assert "technical difficulties" in response
        assert "understandable" in response
    
    def test_get_conversation_history_exists(self, chat_service):
        """Test retrieving existing conversation history."""
        conversation_id = "test-id"
        test_messages = [{"role": "user", "content": "test"}]
        
        chat_service.conversation_sessions[conversation_id] = {
            "messages": test_messages,
            "last_response": "test response"
        }
        
        history = chat_service.get_conversation_history(conversation_id)
        assert history == test_messages
    
    def test_get_conversation_history_not_exists(self, chat_service):
        """Test retrieving non-existent conversation history."""
        history = chat_service.get_conversation_history("non-existent")
        assert history is None


@pytest.mark.asyncio
class TestChatServiceIntegration:
    """Integration tests for ChatService."""
    
    async def test_end_to_end_chat_flow(self):
        """Test complete chat flow with mocked OpenAI."""
        # This would test the complete flow but requires more complex mocking
        # For now, we'll keep it as a placeholder for future integration tests
        pass 