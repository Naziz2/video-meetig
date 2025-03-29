import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Image, Download, X, Mic, MicOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { HfInference } from '@huggingface/inference';

// Add interface for speech messages
interface SpeechMessage {
  id: number;
  text: string;
  speaker: string;
  speaker_id: string;
  room_id: string;
  created_at: string;
}

// Add language options
interface LanguageOption {
  code: string;
  name: string;
}

// Add this type if not already present
interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
  onDownload: (url: string) => void;
}

interface TranscriptPanelProps {
  onClose?: () => void;
  selectedLanguage?: string;
}

const hf = new HfInference(import.meta.env.VITE_HUGGING_FACE_API_KEY);

// Update the useStore hook usage to handle missing channel property
const useRoomChannel = () => {
  const { user } = useStore();
  // Get roomId from URL if possible
  const roomId = window.location.pathname.split('/').pop() || 'default-room';
  return { user, channel: roomId };
};

export const TranscriptPanel = ({ onClose, selectedLanguage = 'en-US' }: TranscriptPanelProps) => {
  const { user, channel } = useRoomChannel();
  const [currentMode, setCurrentMode] = useState<'chat' | 'image' | 'speech'>('chat');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string; images?: string[] }[]>([]);
  const [speechMessages, setSpeechMessages] = useState<SpeechMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const [resumeContent, setResumeContent] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Add language options
  const languageOptions: LanguageOption[] = [
    { code: 'ar-TN', name: 'العربية التونسية' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'en-US', name: 'English' },
    { code: 'ar', name: 'العربية الفصحى' }
  ];

  // Add speech recognition setup
  const startListening = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported');
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage;

      recognition.onresult = async (event: any) => {
        let transcript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript = event.results[i][0].transcript;
          isFinal = event.results[i].isFinal;
        }

        setCurrentTranscript(transcript);

        if (isFinal && transcript.trim()) {
          try {
            const messageData = {
              text: transcript.trim(),
              speaker: user?.name || 'Anonymous',
              speaker_id: user?.id || 'anonymous',
              room_id: channel,
              created_at: new Date().toISOString()
            };

            setCurrentTranscript('');

            const { error } = await supabase
              .from('speech_messages')
              .insert([messageData]);

            if (error) throw error;
          } catch (error) {
            console.error('Error saving speech:', error);
          }
        }
      };

      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      setCurrentTranscript('');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Add real-time sync for speech messages
  useEffect(() => {
    if (currentMode !== 'speech') return;

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('speech_messages')
          .select('*')
          .eq('room_id', channel)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setSpeechMessages(data || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();

    // Set up polling for real-time updates
    const pollInterval = setInterval(loadMessages, 1000);

    // Cleanup
    return () => {
      clearInterval(pollInterval);
    };
  }, [channel, currentMode]);

  const generateImage = async () => {
    if (!userInput.trim()) return;

    const userMessage = {
      role: 'user',
      content: `Image prompt: ${userInput}`,
    };
    setChatMessages((prev) => [...prev, userMessage]);

    setIsGenerating(true);
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_HUGGING_FACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: userInput }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);

      setChatMessages((prev) => [...prev, {
        role: 'ai',
        content: 'Generated image:',
        images: [imageUrl]
      }]);

      setUserInput('');
    } catch (error) {
      console.error('Error generating image:', error);
      setChatMessages((prev) => [...prev, {
        role: 'ai',
        content: 'Sorry, I encountered an error generating the image. Please try again.'
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const downloadImage = (imageUrl: string) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = 'generated-image.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = {
      role: 'user',
      content: userInput,
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setUserInput('');
    setIsAiResponding(true);

    try {
      const response = await hf.textGeneration({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        inputs: `<s>[INST] ${userInput} [/INST]`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          do_sample: true,
          return_full_text: false
        }
      });

      const aiResponse = response.generated_text.trim();
      setChatMessages((prev) => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      setChatMessages((prev) => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsAiResponding(false);
    }
  };

  // Update the generateResume function
  const generateResume = async () => {
    try {
      setIsTyping(true);
      setIsSummaryLoading(true);
      
      // Filter out any empty messages and format the conversation
      const validMessages = speechMessages.filter(msg => msg.text.trim() && msg.speaker.trim());
      
      if (validMessages.length === 0) {
        setResumeContent('No conversation to summarize.');
        return;
      }

      // Get unique speakers
      const speakers = [...new Set(validMessages.map(msg => msg.speaker))];
      
      // Get conversation start and end times
      const startTime = new Date(validMessages[0].created_at).toLocaleTimeString();
      const endTime = new Date(validMessages[validMessages.length - 1].created_at).toLocaleTimeString();
      
      // Format conversation with timestamps
      const formattedConversation = validMessages
        .map(msg => {
          const time = new Date(msg.created_at).toLocaleTimeString();
          return `[${time}] ${msg.speaker}: ${msg.text}`;
        })
        .join('\n');
      
      setResumeContent('Analyzing conversation...');
      
      const response = await hf.textGeneration({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        inputs: `Analyze this meeting conversation and provide a structured summary focusing on project details:

Meeting Duration: ${startTime} - ${endTime}
Participants: ${speakers.join(', ')}

Conversation:
${formattedConversation}

Please provide:
1. Project Overview: Brief summary of what was discussed
2. Key Technical Points: Important technical details or requirements mentioned
3. Critical Keywords: Extract key technical terms, tools, frameworks, or technologies discussed
4. Action Items: List of tasks or next steps identified
5. Important Decisions: Any decisions made during the meeting`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      });

      const summaryText = response.generated_text.trim();

      // Show only the analysis
      let displayedText = `Meeting Summary (${startTime} - ${endTime})\n\n`;
      setResumeContent(displayedText);

      // Animate the analysis part
      for (const char of summaryText) {
        displayedText += char;
        setResumeContent(displayedText);
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setResumeContent('Sorry, I encountered an error generating the summary. Please try again.');
    } finally {
      setIsTyping(false);
      setIsSummaryLoading(false);
    }
  };

  // Add download resume function
  const downloadResume = () => {
    if (!resumeContent) return;

    const blob = new Blob([resumeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversation-summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Update the mode switching functions
  const setMode = (mode: 'chat' | 'image' | 'speech') => {
    setCurrentMode(mode);
    // Clear resume content when switching away from speech mode
    if (mode !== 'speech') {
      setResumeContent(null);
    }
    // Clear user input when switching modes
    setUserInput('');
  };

  // Add this component for the image modal
  const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, onClose, onDownload }) => {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        onClick={onClose}
      >
        <div className="relative max-w-[90vw] max-h-[90vh]">
          <img
            src={imageUrl}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-800/90 rounded-full text-white hover:bg-slate-700"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(imageUrl);
            }}
            className="absolute bottom-4 right-4 p-2 bg-emerald-600 rounded-full text-white hover:bg-emerald-700"
          >
            <Download className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-purple-900/50 bg-slate-700/90">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-purple-400">
            {currentMode === 'chat' ? 'AI Chat' : 
             currentMode === 'image' ? 'Image Generation' : 
             'Speech to Text'}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 scrollbar-thin scrollbar-thumb-purple-600/50 scrollbar-track-slate-700">
        {currentMode === 'speech' ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-3">
              {/* Speech Messages */}
              {speechMessages.map((message) => (
                <div key={message.id} className={`flex ${message.speaker_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 break-words ${
                    message.speaker_id === user?.id 
                      ? 'bg-gradient-to-r from-purple-600/80 to-purple-800/80 text-white' 
                      : 'bg-gradient-to-r from-slate-600/80 to-slate-700/80 text-white'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-purple-200">{message.speaker}</span>
                      <span className="text-sm text-purple-200/80">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm break-words">{message.text}</p>
                  </div>
                </div>
              ))}

              {/* Current Transcript */}
              {currentTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-lg p-3 break-words bg-gradient-to-r from-purple-600/50 to-purple-800/50 text-white">
                    <p className="text-sm break-words">{currentTranscript}</p>
                  </div>
                </div>
              )}

              {/* Summary Container */}
              {resumeContent && (
                <div className="bg-slate-700 rounded-lg border border-purple-900/50">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-purple-400">Meeting Summary</h3>
                      <button
                        onClick={downloadResume}
                        className="p-2 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full text-white hover:from-purple-700 hover:to-purple-900"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-white whitespace-pre-wrap text-sm">
                      {resumeContent}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Chat Messages
          chatMessages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 break-words ${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-purple-600/80 to-purple-800/80 text-white' 
                  : 'bg-gradient-to-r from-slate-600/80 to-slate-700/80 text-white'
              }`}>
                <p className="text-sm break-words">{message.content}</p>
                {message.images && message.images.map((img, imgIndex) => (
                  <div key={imgIndex} className="mt-2 relative group">
                    <img 
                      src={img} 
                      alt="Generated" 
                      className="max-w-full rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(img)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(img);
                      }}
                      className="absolute top-2 right-2 p-2 bg-slate-700/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-purple-900/50 bg-slate-700/90">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode('chat')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
              currentMode === 'chat'
                ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white'
                : 'bg-slate-600 text-purple-400 hover:bg-slate-500'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setMode('image')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
              currentMode === 'image'
                ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white'
                : 'bg-slate-600 text-purple-400 hover:bg-slate-500'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Generate Image</span>
          </button>
          <button
            onClick={() => setMode('speech')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
              currentMode === 'speech'
                ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white'
                : 'bg-slate-600 text-purple-400 hover:bg-slate-500'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Voice Record</span>
          </button>
        </div>

        {/* Input or Speech Controls */}
        {currentMode === 'speech' ? (
          <div className="space-y-2">
            <button
              onClick={toggleListening}
              className={`w-full flex items-center justify-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900'
              } text-white font-medium`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span>{isListening ? "Stop Recording" : "Start Recording"}</span>
            </button>
            {speechMessages.length > 0 && (
              <button
                onClick={generateResume}
                className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-medium"
              >
                <Download className="w-5 h-5" />
                <span>Generate Summary</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (currentMode === 'chat' ? sendMessage() : generateImage())}
              placeholder={currentMode === 'chat' ? "Type your message here..." : "Describe the image you want..."}
              className="flex-1 bg-slate-600 text-white rounded-lg px-3 py-2 border border-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={currentMode === 'chat' ? sendMessage : generateImage}
              disabled={isGenerating}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg hover:from-purple-700 hover:to-purple-900 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentMode === 'chat' ? 'Send' : 'Generate'}
            </button>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
          onDownload={downloadImage}
        />
      )}
    </div>
  );
};