# EverKind Therapeutic API

A FastAPI-based backend service that provides AI-powered therapeutic chat functionality using OpenAI's GPT models with Cognitive Behavioral Therapy (CBT) techniques.

## Features

- AI Therapist: GPT-4 powered therapeutic conversations with CBT focus
- Secure: CORS configuration, input validation, and error handling
- Monitoring: Health checks, request logging, and performance tracking
- Production Ready: Structured logging, environment management, and scalability
- Specialized: Custom therapeutic system prompts and mood-aware responses

## Quick Start

### Prerequisites

- Python 3.8+
- OpenAI API key

### Installation

1. Install dependencies:
```
cd backend
pip install -r requirements.txt
```

2. Set up environment variables:
```
cp env.example .env
# Edit .env and add your OPENAI_API_KEY
```

3. Start the server:
```
python start.py
```

The API will be available at http://localhost:8000

## API Endpoints

### Chat Endpoint
POST /api/v1/chat

Send a message to the AI therapist and receive a therapeutic response.

### Health Check
GET /api/v1/health

Check the API service health status.

### Conversation History
GET /api/v1/conversation/{conversation_id}

Retrieve conversation history by ID.

## Environment Variables

- OPENAI_API_KEY: OpenAI API key (required)
- OPENAI_MODEL: OpenAI model to use (default: gpt-4)
- OPENAI_MAX_TOKENS: Maximum response tokens (default: 500)
- OPENAI_TEMPERATURE: Response creativity 0-1 (default: 0.7)
- HOST: Server host (default: 0.0.0.0)
- PORT: Server port (default: 8000)
- ENVIRONMENT: Environment development/production (default: development)
- LOG_LEVEL: Logging level (default: INFO)

## Development

When running in development mode, interactive API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Therapeutic System

The AI therapist uses evidence-based CBT techniques and provides mood-aware responses for stressed, overwhelmed, depressed, and anxious states.

## Production Deployment

The API includes health monitoring, security features, and is ready for production deployment with proper environment configuration. 