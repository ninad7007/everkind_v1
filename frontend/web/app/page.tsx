'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, Send, Menu, User, Volume2, Loader2, Wifi, WifiOff } from 'lucide-react'
import { useChat } from '../lib/useChat'
import { useRouter } from 'next/navigation'

interface Message {
  id: string
  content: string
  sender: 'ai' | 'user'
  timestamp: Date
}

const moodOptions = [
  { id: 'stressed', label: 'Stressed', description: 'feeling tense and pressured' },
  { id: 'overwhelmed', label: 'Overwhelmed', description: 'struggling to cope with daily tasks' },
  { id: 'depressed', label: 'Depressed', description: 'feeling sad and hopeless' },
  { id: 'anxious', label: 'Anxious', description: 'feeling anxious and worried' },
]

const initialMessages = [
  {
    id: '1',
    content: "I'm your AI Companion and Life Coach. 🤗✨\n\nWelcome to EverKind!\n\nLet's chat about what's on your mind. I'll help you find clarity, motivation, and the strength within yourself.\n\nReady to take the next step? What would you like to talk about today? ⭐",
    sender: 'ai' as const,
    timestamp: new Date(),
  },
]

export default function ChatPage() {
  const router = useRouter()
  const {
    messages,
    isLoading,
    error,
    conversationId,
    sendMessage,
    clearMessages,
    isApiHealthy,
  } = useChat({
    initialMessages,
    onError: (error) => {
      console.error('Chat error:', error);
    },
  });

  const [inputValue, setInputValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading) {
      const messageContent = inputValue
      setInputValue('')
      await sendMessage(messageContent, selectedMood || undefined)
      setSelectedMood(null)
    }
  }

  const handleMoodSelect = async (moodId: string) => {
    setSelectedMood(moodId)
    const mood = moodOptions.find(m => m.id === moodId)
    if (mood) {
      const moodMessage = `I'm feeling ${mood.label.toLowerCase()} - ${mood.description}`
      await sendMessage(moodMessage, moodId)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Implement actual voice recording
  }

  const handleVoiceClick = () => {
    router.push('/voice')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-therapeutic-primary">EverKind</h1>
          {/* API Health Indicator */}
          <div className="flex items-center space-x-1">
            {isApiHealthy ? (
              <div title="Connected to AI therapist">
                <Wifi className="w-4 h-4 text-green-500" />
              </div>
            ) : (
              <div title="Using offline responses">
                <WifiOff className="w-4 h-4 text-orange-500" />
              </div>
            )}
            {conversationId && (
              <span className="text-xs text-gray-500" title={`Conversation ID: ${conversationId}`}>
                Connected
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-therapeutic-primary text-white rounded-lg text-sm font-medium hover:bg-therapeutic-secondary transition-colors">
            Journal
          </button>
          <button 
            onClick={handleVoiceClick}
            className="px-4 py-2 bg-therapeutic-primary text-white rounded-lg text-sm font-medium hover:bg-therapeutic-secondary transition-colors flex items-center space-x-1"
          >
            <Volume2 className="w-4 h-4" />
            <span>Voice</span>
          </button>
        </div>
      </header>

      {/* API Status Banner */}
      {!isApiHealthy && (
        <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
          <p className="text-sm text-orange-800">
            🔄 Using offline responses - some features may be limited.
          </p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2">
          <p className="text-sm text-red-800">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Auth Banner */}
      <div className="bg-orange-50 border-b border-orange-200 px-4 py-2">
        <p className="text-sm text-orange-800">
          Sign in to save your chat history, access features like audio, and more.{' '}
          <button className="underline font-medium">Login</button> or{' '}
          <button className="underline font-medium">Sign Up</button>
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`chat-bubble ${
                message.sender === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'
              }`}
            >
              <p className="whitespace-pre-line">{message.content}</p>
              {message.sender === 'ai' && (
                <span className="text-xs opacity-60 mt-2 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="chat-bubble chat-bubble-ai">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Mood Selection Buttons */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {moodOptions.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                disabled={isLoading}
                className="mood-button text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="font-medium">{mood.label}</div>
                <div className="text-sm opacity-90">{mood.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isLoading ? "AI is thinking..." : "Share your thoughts..."}
              disabled={isLoading}
              className="input-field pr-12 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-therapeutic-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <button
            onClick={toggleRecording}
            disabled={isLoading}
            className={`voice-button disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording ? 'bg-red-500 text-white border-red-500' : ''
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
        
        {/* Selected mood indicator */}
        {selectedMood && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-therapeutic-primary">
              Mood: {moodOptions.find(m => m.id === selectedMood)?.label}
            </span>
            <button
              onClick={() => setSelectedMood(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 