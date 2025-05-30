"""
Unit tests for API routes.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock
from main import app
from api.models import ChatRequest, ChatResponse


@pytest.fixture
def client():
    """Create a test client for the FastAPI application."""
    return TestClient(app)


@pytest.fixture
def sample_chat_data():
    """Sample chat request data for testing."""
    return {
        "message": "I'm feeling stressed about work",
        "conversation_history": [
            {
                "role": "user",
                "content": "Hello",
                "timestamp": "2024-01-01T12:00:00Z"
            }
        ],
        "user_mood": "stressed"
    }


class TestChatEndpoint:
    """Test cases for the chat endpoint."""
    
    @patch('api.routes.settings.OPENAI_API_KEY', 'test-key')
    @patch('api.routes.chat_service.get_therapeutic_response')
    def test_chat_endpoint_success(self, mock_chat_service, client, sample_chat_data):
        """Test successful chat endpoint response."""
        # Mock the chat service response
        mock_response = ChatResponse(
            response="I understand work stress can be challenging. Let's explore this together.",
            conversation_id="test-uuid-123"
        )
        mock_chat_service.return_value = mock_response
        
        response = client.post("/api/v1/chat", json=sample_chat_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "conversation_id" in data
        assert "timestamp" in data
        assert data["response"] == mock_response.response
        assert mock_chat_service.called
    
    def test_chat_endpoint_invalid_data(self, client):
        """Test chat endpoint with invalid request data."""
        invalid_data = {
            "message": "",  # Empty message should fail validation
            "conversation_history": []
        }
        
        response = client.post("/api/v1/chat", json=invalid_data)
        assert response.status_code == 422  # Validation error
    
    def test_chat_endpoint_missing_message(self, client):
        """Test chat endpoint with missing message field."""
        invalid_data = {
            "conversation_history": []
            # Missing required 'message' field
        }
        
        response = client.post("/api/v1/chat", json=invalid_data)
        assert response.status_code == 422  # Validation error
    
    def test_chat_endpoint_message_too_long(self, client):
        """Test chat endpoint with message exceeding length limit."""
        long_message = "x" * 2001  # Exceeds 2000 character limit
        invalid_data = {
            "message": long_message,
            "conversation_history": []
        }
        
        response = client.post("/api/v1/chat", json=invalid_data)
        assert response.status_code == 422  # Validation error
    
    @patch('api.routes.settings.OPENAI_API_KEY', None)
    def test_chat_endpoint_no_api_key(self, client, sample_chat_data):
        """Test chat endpoint when OpenAI API key is not configured."""
        response = client.post("/api/v1/chat", json=sample_chat_data)
        
        assert response.status_code == 500
        data = response.json()
        assert "AI service not configured" in data["detail"]
    
    @patch('api.routes.settings.OPENAI_API_KEY', 'test-key')
    @patch('api.routes.chat_service.get_therapeutic_response')
    def test_chat_endpoint_service_error(self, mock_chat_service, client, sample_chat_data):
        """Test chat endpoint when chat service raises an exception."""
        mock_chat_service.side_effect = Exception("Service error")
        
        response = client.post("/api/v1/chat", json=sample_chat_data)
        
        assert response.status_code == 500
        data = response.json()
        assert "unexpected error occurred" in data["detail"]


class TestHealthEndpoint:
    """Test cases for the health endpoint."""
    
    @patch('api.routes.settings.OPENAI_API_KEY', 'test-key')
    def test_health_endpoint_healthy(self, client):
        """Test health endpoint when service is healthy."""
        response = client.get("/api/v1/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "timestamp" in data
    
    @patch('api.routes.settings.OPENAI_API_KEY', None)
    def test_health_endpoint_unhealthy(self, client):
        """Test health endpoint when API key is not configured."""
        response = client.get("/api/v1/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "unhealthy"
        assert "version" in data
    
    def test_root_health_endpoint(self, client):
        """Test root level health endpoint."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "everkind-api"


class TestConversationEndpoint:
    """Test cases for the conversation history endpoint."""
    
    @patch('api.routes.chat_service.get_conversation_history')
    def test_get_conversation_success(self, mock_get_history, client):
        """Test successful conversation history retrieval."""
        conversation_id = "test-uuid-123"
        mock_history = [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi there!"}
        ]
        mock_get_history.return_value = mock_history
        
        response = client.get(f"/api/v1/conversation/{conversation_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["conversation_id"] == conversation_id
        assert data["messages"] == mock_history
        assert mock_get_history.called_with(conversation_id)
    
    @patch('api.routes.chat_service.get_conversation_history')
    def test_get_conversation_not_found(self, mock_get_history, client):
        """Test conversation history retrieval for non-existent conversation."""
        conversation_id = "non-existent"
        mock_get_history.return_value = None
        
        response = client.get(f"/api/v1/conversation/{conversation_id}")
        
        assert response.status_code == 404
        data = response.json()
        assert "Conversation not found" in data["detail"]
    
    @patch('api.routes.chat_service.get_conversation_history')
    def test_get_conversation_service_error(self, mock_get_history, client):
        """Test conversation history when service raises an exception."""
        conversation_id = "test-uuid"
        mock_get_history.side_effect = Exception("Database error")
        
        response = client.get(f"/api/v1/conversation/{conversation_id}")
        
        assert response.status_code == 500
        data = response.json()
        assert "Error retrieving conversation history" in data["detail"]


class TestRootEndpoint:
    """Test cases for the root API endpoint."""
    
    def test_root_endpoint(self, client):
        """Test root API endpoint returns basic information."""
        response = client.get("/api/v1/")
        
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "description" in data
        assert "version" in data
        assert "status" in data
        assert data["status"] == "running"
        assert "/docs" in data["docs"]
        assert "/health" in data["health"] 