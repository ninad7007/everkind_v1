#!/usr/bin/env python3
"""
Demo script to test the EverKind Therapeutic API locally.
"""

import asyncio
import json
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from api.models import ChatRequest, ChatMessage
from api.chat_service import chat_service


async def demo_chat():
    """Demo the chat functionality."""
    print("🧠 EverKind Therapeutic API Demo")
    print("=" * 40)
    
    # Test basic chat without mood
    print("\n1. Testing basic chat without mood:")
    request1 = ChatRequest(
        message="Hello, I'm feeling a bit overwhelmed today.",
        conversation_history=[]
    )
    
    response1 = await chat_service.get_therapeutic_response(request1)
    print(f"User: {request1.message}")
    print(f"Therapist: {response1.response}")
    print(f"Conversation ID: {response1.conversation_id}")
    
    # Test chat with mood context
    print("\n2. Testing chat with mood context:")
    request2 = ChatRequest(
        message="I've been having trouble sleeping and feel anxious about work.",
        conversation_history=[
            ChatMessage(role="user", content="Hello, I'm feeling a bit overwhelmed today."),
            ChatMessage(role="assistant", content=response1.response)
        ],
        user_mood="anxious"
    )
    
    response2 = await chat_service.get_therapeutic_response(request2)
    print(f"User: {request2.message}")
    print(f"User Mood: {request2.user_mood}")
    print(f"Therapist: {response2.response}")
    
    # Test different moods
    print("\n3. Testing different mood responses:")
    moods = ["stressed", "depressed", "overwhelmed", "confused"]
    
    for mood in moods:
        request = ChatRequest(
            message=f"I'm feeling {mood} right now.",
            conversation_history=[],
            user_mood=mood
        )
        
        response = await chat_service.get_therapeutic_response(request)
        print(f"\nMood: {mood}")
        print(f"Response: {response.response}")
    
    print("\n" + "=" * 40)
    print("✅ Demo completed successfully!")
    
    if not chat_service.client:
        print("\n⚠️  Note: OpenAI client not configured - using fallback responses")
        print("   Set OPENAI_API_KEY environment variable for full functionality")


if __name__ == "__main__":
    asyncio.run(demo_chat()) 