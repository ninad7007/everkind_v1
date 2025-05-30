# Frontend-Backend Integration Guide

This document describes how the EverKind frontend and backend are integrated to provide a seamless therapeutic chat experience.

## Architecture Overview

```
Frontend (Next.js)     Backend (FastAPI)      AI Service
localhost:3000    →    localhost:8000    →    OpenAI GPT-4
                      
User Interface    →    API Client       →    Chat Service → Therapeutic AI
```

## Integration Components

### 1. API Client (`frontend/web/lib/api.ts`)
- Handles HTTP communication with the backend
- Manages request/response formatting
- Provides error handling and retries
- Supports health checks and conversation history

### 2. Chat Hook (`frontend/web/lib/useChat.ts`)
- React hook for managing chat state
- Integrates with API client
- Handles loading states and errors
- Provides fallback responses when API is unavailable

### 3. UI Components (`frontend/web/app/page.tsx`)
- Real-time chat interface
- Mood selection and context passing
- Loading indicators and error handling
- Auto-scroll and message timestamps

## API Endpoints Used

| Frontend Action | Backend Endpoint | Purpose |
|----------------|------------------|---------|
| Health Check | `GET /api/v1/health` | Verify API availability |
| Send Message | `POST /api/v1/chat` | Get AI therapeutic response |
| Get History | `GET /api/v1/conversation/{id}` | Retrieve conversation |

## Message Flow

1. **User Input**: User types message and selects optional mood
2. **Frontend Processing**: Message added to UI immediately
3. **API Request**: Message sent to backend with conversation history
4. **Backend Processing**: OpenAI generates therapeutic response
5. **Response Display**: AI response appears in chat interface

## Environment Configuration

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

### Backend
- `OPENAI_API_KEY`: OpenAI API key for GPT-4 access
- `ENVIRONMENT`: development/production mode
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)

## Development Setup

### Start Backend
```bash
cd backend
pip install -r requirements.txt
cp env.example .env
# Add your OPENAI_API_KEY to .env
python3 start.py
```

### Start Frontend
```bash
cd frontend/web
npm install
npm run dev
```

### Test Integration
```bash
# Test backend health
curl http://localhost:8000/health

# Test chat endpoint
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I feel stressed", "user_mood": "stressed"}'

# Access frontend
open http://localhost:3000
```

## Error Handling

### Frontend
- **API Unavailable**: Shows offline mode indicator
- **Network Errors**: Displays error banner with details
- **Fallback Responses**: Provides mood-specific therapeutic responses

### Backend
- **OpenAI Failures**: Returns predefined therapeutic fallback responses
- **Validation Errors**: Returns structured error messages
- **Health Monitoring**: Continuous health check endpoints

## Features

### Real-Time Chat
- ✅ Instant message display
- ✅ Typing indicators
- ✅ Auto-scroll to latest messages
- ✅ Message timestamps

### Mood-Aware Responses
- ✅ Mood selection buttons
- ✅ Context-aware AI responses
- ✅ Specialized therapeutic prompts
- ✅ Fallback mood responses

### Production Features
- ✅ Error boundaries and handling
- ✅ Loading states and indicators
- ✅ Health status monitoring
- ✅ Graceful degradation

### Security
- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ Environment-based configuration
- ✅ Error message sanitization

## Monitoring

### Health Indicators
- **Green WiFi Icon**: API healthy and connected
- **Orange WiFi Icon**: API unavailable, using fallback
- **Conversation ID**: Shows when connected to backend

### Debug Information
- Browser console shows API requests/responses
- Backend logs show request details and AI responses
- Error messages displayed in UI for troubleshooting

## Production Considerations

### Frontend Deployment
- Build optimized bundle: `npm run build`
- Set production API URL in environment
- Enable compression and caching

### Backend Deployment
- Use production WSGI server (gunicorn/uvicorn)
- Configure environment variables securely
- Set up health monitoring and logging

### Integration Testing
```bash
# Run backend tests
cd backend && python3 -m pytest tests/ -v

# Test API endpoints
curl -f http://localhost:8000/health || echo "Backend not running"
curl -f http://localhost:3000 || echo "Frontend not running"
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check backend CORS configuration
   - Verify frontend URL in allowed origins

2. **API Connection Failed**
   - Ensure backend is running on correct port
   - Check firewall and network settings

3. **OpenAI API Errors**
   - Verify API key is set correctly
   - Check API quota and billing status

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript compilation errors

The integration is now complete and provides a robust, production-ready therapeutic chat application with real-time AI responses and comprehensive error handling. 