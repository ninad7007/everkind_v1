import React, { useState, useRef, useEffect } from 'react';

interface EmotionScores {
  [key: string]: number;
}

interface Message {
  text: string;
  emotion: string;
  confidence: number;
  timestamp: number;
  isFinal: boolean;
}

// Add TypeScript declarations for Web Speech API
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
    webkitAudioContext: typeof AudioContext;
  }
}

// Remove the API constants and add dummy emotion mapping
const DUMMY_EMOTIONS = {
  happy: ['great', 'wonderful', 'happy', 'excited', 'joy', 'love', 'fantastic', 'amazing'],
  sad: ['sad', 'upset', 'unhappy', 'depressed', 'down', 'hurt', 'pain', 'sorry'],
  angry: ['angry', 'mad', 'frustrated', 'annoyed', 'hate', 'furious', 'rage'],
  fearful: ['scared', 'afraid', 'worried', 'nervous', 'anxious', 'fear', 'terrified'],
  surprised: ['wow', 'oh', 'unexpected', 'surprised', 'shocked', 'amazing', 'unbelievable'],
  neutral: ['okay', 'fine', 'normal', 'alright', 'regular', 'usual'],
  calm: ['calm', 'peaceful', 'relaxed', 'quiet', 'serene', 'tranquil', 'gentle'],
  disgust: ['gross', 'disgusting', 'awful', 'horrible', 'terrible', 'yuck', 'ugh']
};

interface WaveformProps {
  isActive: boolean;
}

const Waveform: React.FC<WaveformProps> = ({ isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dotsRef = useRef<{ x: number; y: number }[]>([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize dots positions
    if (dotsRef.current.length === 0) {
      const numDots = 20; // Number of dots
      const spacing = canvas.width / (numDots + 1);
      for (let i = 0; i < numDots; i++) {
        dotsRef.current.push({
          x: spacing * (i + 1),
          y: canvas.height / 2
        });
      }
    }

    const drawDots = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dotsRef.current.forEach((dot, i) => {
        // Draw inactive dots
        if (!isActive) {
          ctx.beginPath();
          ctx.arc(dot.x, canvas.height / 2, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#e5e7eb';
          ctx.fill();
          return;
        }

        // For active state, calculate dot position
        if (analyserRef.current) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteTimeDomainData(dataArray);

          // Calculate average volume for this segment
          const segmentSize = Math.floor(bufferLength / dotsRef.current.length);
          const start = i * segmentSize;
          const end = start + segmentSize;
          const segmentAverage = Array.from(dataArray.slice(start, end))
            .reduce((sum, val) => sum + Math.abs(val - 128), 0) / segmentSize;
          
          const normalizedVolume = segmentAverage / 128;
          
          // Calculate dot position with smooth animation
          const time = Date.now() / 1000;
          const baseOffset = Math.sin(time * 3 + i * 0.5) * 2; // Subtle base movement
          const amplitude = 15 * normalizedVolume; // Adjust this value to control dot movement range
          
          dot.y = canvas.height / 2 + baseOffset + (Math.sin(time * 5 + i * 0.5) * amplitude);
        }

        // Draw active dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
      });
    };

    const animate = () => {
      drawDots();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  return (
    <div className="relative w-full">
      <canvas
        ref={canvasRef}
        className="w-full h-8"
        width={400}
        height={32}
        style={{ maxWidth: '100%' }}
      />
    </div>
  );
};

const VoiceEmotionDetector: React.FC = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [emotions, setEmotions] = useState<EmotionScores>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout>();
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    initializeSpeechRecognition();
    return () => cleanup();
  }, []);

  // Start audio context when call starts
  useEffect(() => {
    if (isCallStarted && !isMuted) {
      initializeAudioContext();
      startListening();
    } else {
      cleanup();
    }
  }, [isCallStarted, isMuted]);

  const initializeAudioContext = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
    } catch (error) {
      console.error('Error initializing audio context:', error);
      setIsCallStarted(false);
    }
  };

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsRecognitionActive(true);
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsRecognitionActive(false);
        // Only restart if call is active and not muted
        if (isCallStarted && !isMuted) {
          startListening();
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsRecognitionActive(false);
        }
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setIsSpeaking(false);
          } else {
            interimTranscript += transcript;
            setIsSpeaking(true);
          }
        }

        // Add interim results as a temporary message
        if (interimTranscript) {
          setMessages(prev => {
            const newMessages = [...prev];
            // Remove previous interim message if it exists
            if (newMessages.length > 0 && !newMessages[newMessages.length - 1].isFinal) {
              newMessages.pop();
            }
            newMessages.push({
              text: interimTranscript,
              emotion: 'neutral',
              confidence: 1,
              timestamp: Date.now(),
              isFinal: false
            });
            return newMessages;
          });
        }

        // Add final results as a permanent message
        if (finalTranscript) {
          const emotionScores = getDummyEmotions(finalTranscript);
          const dominantEmotion = getDominantEmotion();
          
          setMessages(prev => {
            const newMessages = [...prev];
            // Remove last interim message if it exists
            if (newMessages.length > 0 && !newMessages[newMessages.length - 1].isFinal) {
              newMessages.pop();
            }
            newMessages.push({
              text: finalTranscript,
              emotion: dominantEmotion?.emotion || 'neutral',
              confidence: dominantEmotion?.score || 1,
              timestamp: Date.now(),
              isFinal: true
            });
            return newMessages;
          });

          setEmotions(emotionScores);
        }

        // Reset silence timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        silenceTimeoutRef.current = setTimeout(() => {
          setIsSpeaking(false);
        }, 1500);
      };
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isRecognitionActive && !isMuted) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setIsRecognitionActive(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isRecognitionActive) {
      try {
        recognitionRef.current.stop();
        setIsRecognitionActive(false);
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  };

  const handleMuteToggle = () => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted; // Toggle the current state
      });
      setIsMuted(!isMuted);
      
      // Stop recognition if muting, start if unmuting
      if (!isMuted) { // About to mute
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        setIsRecognitionActive(false);
        setIsSpeaking(false);
      } else { // About to unmute
        if (isCallStarted) {
          startListening();
        }
      }
    }
  };

  const cleanup = () => {
    stopListening();
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
  };

  const getDummyEmotions = (text: string): EmotionScores => {
    const words = text.toLowerCase().split(' ');
    const scores: EmotionScores = {
      happy: 0.1,
      sad: 0.1,
      angry: 0.1,
      fearful: 0.1,
      surprised: 0.1,
      neutral: 0.3, // Default higher neutral score
      calm: 0.1,
      disgust: 0.1
    };

    // Count emotion word matches
    words.forEach(word => {
      for (const [emotion, keywords] of Object.entries(DUMMY_EMOTIONS)) {
        if (keywords.some(keyword => word.includes(keyword))) {
          scores[emotion] += 0.2; // Increase score for each matching word
        }
      }
    });

    // Normalize scores
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    Object.keys(scores).forEach(emotion => {
      scores[emotion] = Math.round((scores[emotion] / total) * 100) / 100;
    });

    return scores;
  };

  const getDominantEmotion = () => {
    if (!emotions || Object.keys(emotions).length === 0) return null;
    
    return Object.entries(emotions).reduce((max, [emotion, score]) => 
      score > max.score ? { emotion, score } : max
    , { emotion: '', score: 0 });
  };

  const getEmotionEmoji = (emotion: string) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'fearful': return '😨';
      case 'calm': return '😌';
      case 'disgust': return '🤢';
      case 'surprised': return '😲';
      default: return '😐';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleStartCall = () => {
    setIsCallStarted(true);
  };

  const handleEndCall = () => {
    setIsCallStarted(false);
    setMessages([]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-full bg-white">
      {/* Main Content Area */}
      {!isCallStarted ? (
        <div className="h-screen flex items-center justify-center">
          <button
            onClick={handleStartCall}
            className="flex items-center justify-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-8 py-4 rounded-full shadow-lg transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-lg">Start Voice Chat</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col h-screen">
          <div 
            className="flex-1 px-4 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" 
            style={{ 
              overflowY: messages.length > 0 ? 'auto' : 'hidden',
              paddingBottom: '6rem'
            }}
          >
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col max-w-[85%] transition-all duration-200 ${
                    message.isFinal ? 'opacity-100' : 'opacity-80'
                  }`}
                >
                  <div className={`
                    ${message.isFinal ? 'bg-blue-50' : 'bg-gray-50'} 
                    rounded-2xl rounded-tl-none px-6 py-4 shadow-sm
                    transform transition-all duration-200
                  `}>
                    <p className="text-gray-800 text-lg leading-relaxed break-words">
                      {message.text}
                    </p>
                    {message.isFinal && (
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span className="mr-2">{getEmotionEmoji(message.emotion)}</span>
                        <span className="mr-2 capitalize">{message.emotion}</span>
                        <span className="opacity-75">
                          {Math.round(message.confidence * 100)}%
                        </span>
                        <span className="ml-auto text-xs">{formatTime(message.timestamp)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom Voice Activity Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
            <div className="max-w-3xl mx-auto px-6 py-4">
              <div className="flex items-center space-x-4 bg-gray-50 rounded-full px-4 py-2">
                <button 
                  onClick={handleMuteToggle}
                  className={`p-1 rounded-full transition-colors duration-200 hover:bg-gray-100 ${
                    isMuted ? 'text-red-500' : 'text-teal-500'
                  }`}
                >
                  {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3zM5.5 5.5L19 19M19 5.5L5.5 19" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
                <div className="flex-1">
                  <Waveform isActive={isSpeaking && !isMuted} />
                </div>
                <button
                  onClick={handleEndCall}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span>End Call</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceEmotionDetector;
