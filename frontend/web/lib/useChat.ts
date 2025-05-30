import { useState, useCallback, useEffect } from 'react';
import { apiClient, convertToApiFormat, type ChatResponse } from './api';

export interface Message {
  id: string;
  content: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

export interface UseChatOptions {
  initialMessages?: Message[];
  onError?: (error: Error) => void;
}

export interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  sendMessage: (content: string, mood?: string) => Promise<void>;
  clearMessages: () => void;
  isApiHealthy: boolean;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { initialMessages = [], onError } = options;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isApiHealthy, setIsApiHealthy] = useState(true);

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await apiClient.checkHealth();
        setIsApiHealthy(true);
      } catch (error) {
        console.warn('API health check failed, will use fallback responses', error);
        setIsApiHealthy(false);
      }
    };

    checkHealth();
  }, []);

  const sendMessage = useCallback(async (content: string, mood?: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Prepare conversation history (exclude the current message)
      const conversationHistory = convertToApiFormat(messages);

      // Send to API
      const response: ChatResponse = await apiClient.sendChatMessage({
        message: content.trim(),
        conversation_history: conversationHistory,
        user_mood: mood,
      });

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'ai',
        timestamp: new Date(response.timestamp),
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationId(response.conversation_id);

    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);

      // Add fallback AI response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm sorry, I'm having some technical difficulties right now. Your feelings are valid and important. ${
          mood ? getFallbackMoodResponse(mood) : 'How are you feeling right now?'
        }`,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, fallbackMessage]);

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    } finally {
      setIsLoading(false);
    }
  }, [messages, onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    conversationId,
    sendMessage,
    clearMessages,
    isApiHealthy,
  };
}

// Fallback responses for different moods when API is unavailable
function getFallbackMoodResponse(mood: string): string {
  const moodResponses: Record<string, string> = {
    stressed: "When feeling stressed, try taking three deep breaths and focusing on what you can control right now.",
    overwhelmed: "Feeling overwhelmed is tough. Consider breaking down your challenges into smaller, manageable steps.",
    depressed: "Depression can feel isolating, but you're not alone. Small steps forward are still progress.",
    anxious: "Anxiety can be challenging. Try grounding yourself by noticing 5 things you can see around you.",
  };

  return moodResponses[mood.toLowerCase()] || "Whatever you're feeling right now is understandable.";
} 