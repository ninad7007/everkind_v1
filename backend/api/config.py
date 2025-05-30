"""
Configuration settings for the EverKind API.
"""

import os
from dotenv import load_dotenv
from typing import Optional

# Load environment variables from .env file
load_dotenv()


class Settings:
    """
    Application settings loaded from environment variables.
    """
    
    # API Configuration
    API_VERSION: str = "1.0.0"
    API_TITLE: str = "EverKind Therapeutic API"
    API_DESCRIPTION: str = "AI-powered therapeutic chat API using CBT techniques"
    
    # OpenAI Configuration
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4")
    OPENAI_MAX_TOKENS: int = int(os.getenv("OPENAI_MAX_TOKENS", "500"))
    OPENAI_TEMPERATURE: float = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))
    
    # Server Configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # CORS Configuration
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "https://everkind-demo.15rock.com",
        "http://localhost:8000"
    ]
    
    # Therapeutic System Prompt
    THERAPIST_SYSTEM_PROMPT: str = """You are EverKind, a compassionate AI therapist specializing in Cognitive Behavioral Therapy (CBT). 

Your role is to:
- Provide empathetic, non-judgmental support
- Use evidence-based CBT techniques
- Help users identify and challenge negative thought patterns
- Encourage healthy coping strategies
- Validate emotions while promoting growth
- Ask thoughtful follow-up questions
- Maintain professional therapeutic boundaries

Guidelines:
- Keep responses concise (2-3 sentences typically)
- Use warm, supportive language
- Focus on the present moment and actionable insights
- Encourage self-reflection and awareness
- If someone expresses crisis thoughts, gently suggest professional help
- Adapt your tone to match the user's emotional state
- Use the user's mood context when provided

Remember: You're here to support, guide, and empower users on their mental health journey using proven CBT principles."""

    @property
    def is_production(self) -> bool:
        """Check if running in production environment."""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development environment."""
        return self.ENVIRONMENT.lower() == "development"
    
    def validate_settings(self) -> bool:
        """
        Validate that required settings are present.
        
        Returns:
            bool: True if all required settings are valid
        """
        if not self.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        return True


# Global settings instance
settings = Settings() 