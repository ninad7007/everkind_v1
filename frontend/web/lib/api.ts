/**
 * API client for communicating with the EverKind backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  conversation_history: ChatMessage[];
  user_mood?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  timestamp: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Send a chat message to the AI therapist
   */
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  /**
   * Check the health of the API
   */
  async checkHealth(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking API health:', error);
      throw error;
    }
  }

  /**
   * Get conversation history by ID
   */
  async getConversation(conversationId: string): Promise<{ conversation_id: string; messages: ChatMessage[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/conversation/${conversationId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Helper function to convert frontend message format to API format
export function convertToApiFormat(messages: Array<{ content: string; sender: 'ai' | 'user'; timestamp: Date }>): ChatMessage[] {
  return messages.map(msg => ({
    role: msg.sender === 'ai' ? 'assistant' : 'user',
    content: msg.content,
    timestamp: msg.timestamp.toISOString(),
  }));
}

// Helper function to convert API format to frontend format
export function convertFromApiFormat(messages: ChatMessage[]): Array<{ id: string; content: string; sender: 'ai' | 'user'; timestamp: Date }> {
  return messages.map((msg, index) => ({
    id: `${Date.now()}-${index}`,
    content: msg.content,
    sender: msg.role === 'assistant' ? 'ai' : 'user',
    timestamp: new Date(msg.timestamp),
  }));
} 