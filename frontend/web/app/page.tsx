'use client'

import { useState } from 'react'
import { Mic, Send, Menu, User, Volume2 } from 'lucide-react'

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

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "I'm your AI Companion and Life Coach. 🤗✨\n\nWelcome to EverKind!\n\nLet's chat about what's on your mind. I'll help you find clarity, motivation, and the strength within yourself.\n\nReady to take the next step? What would you like to talk about today? ⭐",
      sender: 'ai',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: inputValue,
        sender: 'user',
        timestamp: new Date(),
      }
      setMessages([...messages, newMessage])
      setInputValue('')
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: "Thank you for sharing that with me. I understand how you're feeling. Let's work through this together. Can you tell me more about what's been on your mind lately?",
          sender: 'ai',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiResponse])
      }, 1000)
    }
  }

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId)
    const mood = moodOptions.find(m => m.id === moodId)
    if (mood) {
      const moodMessage: Message = {
        id: Date.now().toString(),
        content: `I'm feeling ${mood.label.toLowerCase()} - ${mood.description}`,
        sender: 'user',
        timestamp: new Date(),
      }
      setMessages([...messages, moodMessage])
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `I hear that you're feeling ${mood.label.toLowerCase()}. That takes courage to share. Let's explore this together. What specific situations or thoughts have been contributing to these feelings?`,
          sender: 'ai',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiResponse])
      }, 1000)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Implement actual voice recording
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
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 bg-therapeutic-primary text-white rounded-lg text-sm font-medium hover:bg-therapeutic-secondary transition-colors">
            Journal
          </button>
          <button className="px-4 py-2 bg-therapeutic-primary text-white rounded-lg text-sm font-medium hover:bg-therapeutic-secondary transition-colors flex items-center space-x-1">
            <Volume2 className="w-4 h-4" />
            <span>Voice</span>
          </button>
        </div>
      </header>

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
            </div>
          </div>
        ))}
      </div>

      {/* Mood Selection Buttons */}
      {messages.length === 1 && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {moodOptions.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className="mood-button text-left"
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
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Share your thoughts..."
              className="input-field pr-12"
            />
            <button
              onClick={handleSendMessage}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-therapeutic-primary transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={toggleRecording}
            className={`voice-button ${isRecording ? 'bg-red-500 text-white border-red-500' : ''}`}
          >
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
} 