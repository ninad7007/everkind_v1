'use client'

import VoiceEmotionDetector from '@/components/ui/voice/stt/VoiceEmotionDetector';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VoicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg mr-3"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-therapeutic-primary">Voice Chat</h1>
      </header>

      <div className="max-w-4xl mx-auto p-4">
        <VoiceEmotionDetector />
      </div>
    </div>
  );
} 