import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Image, Download, X, Mic, MicOff } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { HfInference } from '@huggingface/inference';
import { LanguageOption, languageOptions } from '../utils/languageOptions';

// Add interface for speech messages
interface SpeechMessage {
  id: number;
  text: string;
  speaker: string;
  speaker_id: string;
  room_id: string;
  created_at: string;
}

// Add this type if not already present
interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
  onDownload: (url: string) => void;
}

interface TranscriptPanelProps {
  onClose?: () => void;
  selectedLanguage: string;
}

const hf = new HfInference(import.meta.env.VITE_HUGGING_FACE_API_KEY);

// Update the useStore hook usage to handle missing channel property
const useRoomChannel = () => {
  const { user } = useStore();
  // Get roomId from URL if possible
  const roomId = window.location.pathname.split('/').pop() || 'default-room';
  return { user, channel: roomId };
};

// Add more emoji categories for summaries and different response types
const EMOJIS = {
  greeting: ['👋', '😊', '🙂', '👍'],
  question: ['🤔', '❓', '🧐', '🔍'],
  announcement: ['📢', '📣', '🔔', '💡'],
  technical: ['💻', '⚙️', '🔧', '📊'],
  confirmation: ['✅', '👌', '👍', '🎯'],
  farewell: ['👋', '✌️', '🙋‍♂️', '👋‍♀️'],
  ai: ['🤖', '🧠', '🔮', '💭'],
  summary: ['📋', '📝', '📊', '📈', '🗂️'],
  positive: ['👏', '🎉', '🌟', '✨', '🚀'],
  negative: ['😓', '⚠️', '��', '❗', '⛔']
};

// Helper function to get a random emoji based on message content
const getRandomEmoji = (message: string, isAi = false): string => {
  if (isAi) {
    return EMOJIS.ai[Math.floor(Math.random() * EMOJIS.ai.length)];
  }
  
  message = message.toLowerCase();
  
  if (message.includes('hello') || message.includes('hi ') || message.includes('hey')) {
    return EMOJIS.greeting[Math.floor(Math.random() * EMOJIS.greeting.length)];
  } else if (message.includes('?')) {
    return EMOJIS.question[Math.floor(Math.random() * EMOJIS.question.length)];
  } else if (message.includes('announce') || message.includes('attention') || message.includes('listen')) {
    return EMOJIS.announcement[Math.floor(Math.random() * EMOJIS.announcement.length)];
  } else if (message.includes('code') || message.includes('bug') || message.includes('fix') || message.includes('feature')) {
    return EMOJIS.technical[Math.floor(Math.random() * EMOJIS.technical.length)];
  } else if (message.includes('yes') || message.includes('agree') || message.includes('confirm') || message.includes('ok')) {
    return EMOJIS.confirmation[Math.floor(Math.random() * EMOJIS.confirmation.length)];
  } else if (message.includes('bye') || message.includes('goodbye') || message.includes('see you')) {
    return EMOJIS.farewell[Math.floor(Math.random() * EMOJIS.farewell.length)];
  }
  
  // Default random emoji
  const allEmojis = [...EMOJIS.greeting, ...EMOJIS.question, ...EMOJIS.technical, ...EMOJIS.confirmation];
  return allEmojis[Math.floor(Math.random() * allEmojis.length)];
};

// Component for typewriter text
const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 15); // typing speed in ms
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);
  
  return (
    <>
      {displayedText}
      {currentIndex < text.length && <span className="animate-pulse">|</span>}
    </>
  );
};

export const TranscriptPanel = ({ onClose, selectedLanguage }: TranscriptPanelProps) => {
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
  const [summaryLanguage, setSummaryLanguage] = useState<string>(selectedLanguage);

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

    const emoji = getRandomEmoji(userInput);
    const userMessageContent = `${emoji} ${userInput}`;

    const newMessage = {
      role: 'user',
      content: userMessageContent,
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

      const aiEmoji = getRandomEmoji('', true);
      const aiResponse = response.generated_text.trim();
      
      // First add a placeholder message for typing animation
      setChatMessages((prev) => [...prev, { 
        role: 'ai-typing', 
        content: `${aiEmoji} ${aiResponse}` 
      }]);
      
      // After a delay based on text length, replace with final message
      setTimeout(() => {
        setChatMessages((prev) => {
          const filtered = prev.filter(msg => msg.role !== 'ai-typing');
          return [...filtered, { 
            role: 'ai', 
            content: `${aiEmoji} ${aiResponse}` 
          }];
        });
      }, Math.min(aiResponse.length * 15, 5000)); // Cap at 5 seconds max
    } catch (error) {
      console.error('Error sending chat message:', error);
      const aiEmoji = getRandomEmoji('', true);
      setChatMessages((prev) => [...prev, { 
        role: 'ai', 
        content: `${aiEmoji} Sorry, I encountered an error. Please try again.` 
      }]);
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
      
      // Get the selected language name for clarity
      const selectedLangName = getLanguageName(summaryLanguage);
      console.log(`Generating summary in: ${getLanguageDisplayInfo(summaryLanguage)}`);
      
      const response = await hf.textGeneration({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        inputs: `You are a multilingual AI assistant. Your task is to analyze this meeting conversation and provide a structured summary.

IMPORTANT: Your response MUST be written ONLY in ${selectedLangName} language (${summaryLanguage}). 
DO NOT use English or any other language except ${selectedLangName}.

Meeting Duration: ${startTime} - ${endTime}
Participants: ${speakers.join(', ')}

Conversation:
${formattedConversation}

Please provide a complete summary in ${selectedLangName} language with these sections:
1. Project Overview: Brief summary of what was discussed
2. Key Technical Points: Important technical details or requirements mentioned
3. Critical Keywords: Extract key technical terms, tools, frameworks, or technologies discussed
4. Action Items: List of tasks or next steps identified
5. Important Decisions: Any decisions made during the meeting

You must use emojis for each section and make the summary visually appealing. Use bold, lists, and other formatting to organize information.
Your response should NOT include any disclaimers, model limitations, or text explaining what you're going to do.
Just give me the formatted summary directly, starting with the sections requested and after the sections add a summary of the meeting with emojis and bold.

REPEAT: The ENTIRE response must be in ${selectedLangName} language (${summaryLanguage}) only.`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3,
          top_p: 0.9,
          do_sample: true,
          return_full_text: false
        }
      });

      const summaryText = response.generated_text.trim();

      // Process the summary to remove any unwanted headers or command text
      const cleanedSummary = summaryText
        .replace(/^(I'll provide|Here's|The following is|I will provide).*?\n/i, '')
        .replace(/^(Let me provide|I'm providing|Here is|This is).*?\n/i, '');

      // Show the meeting summary with a formatted header
      const emoji = EMOJIS.summary[Math.floor(Math.random() * EMOJIS.summary.length)];
      let displayedText = `${emoji} Meeting Summary (${startTime} - ${endTime}) ${emoji}\n\n${cleanedSummary}`;
      setResumeContent(displayedText);
    } catch (error) {
      console.error('Error generating summary:', error);
      const emoji = EMOJIS.negative[Math.floor(Math.random() * EMOJIS.negative.length)];
      setResumeContent(`${emoji} Sorry, I encountered an error generating the summary. Please try again.`);
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-meeting-panel-dark/90"
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
            className="absolute top-4 right-4 p-2 bg-meeting-control-dark rounded-full text-white hover:bg-meeting-control-dark/70"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload(imageUrl);
            }}
            className="absolute bottom-4 right-4 p-2 bg-primary-500 rounded-full text-white hover:bg-primary-600"
          >
            <Download className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  };

  // Add useEffect to regenerate summary when language changes
  useEffect(() => {
    // If we have a summary and we're in speech mode, regenerate it when language changes
    if (
      resumeContent && 
      resumeContent !== 'Analyzing conversation...' && 
      currentMode === 'speech' && 
      speechMessages.length > 0
    ) {
      generateResume();
    }
  }, [summaryLanguage]);

  return (
    <div className="flex flex-col h-full bg-meeting-panel-dark">
      {/* Header */}
      <div className="px-4 py-3 border-b border-secondary-700 bg-meeting-surface-dark/90">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">
            {currentMode === 'chat' ? 'AI Chat' : 
             currentMode === 'image' ? 'Image Generation' : 
             'Speech to Text'}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 scrollbar-thin scrollbar-thumb-primary-500/50 scrollbar-track-meeting-surface-dark">
        {currentMode === 'speech' ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-3">
              {/* Speech Messages */}
              {speechMessages.map((message) => (
                <div key={message.id} className={`flex ${message.speaker_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 break-words ${
                    message.speaker_id === user?.id 
                      ? 'bg-primary-500/80 text-white' 
                      : 'bg-meeting-surface-dark/80 text-white'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{message.speaker}</span>
                      <span className="text-sm text-white/80">
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
                  <div className="max-w-[80%] rounded-lg p-3 break-words bg-primary-500/50 text-white">
                    <p className="text-sm break-words">{currentTranscript}</p>
                  </div>
                </div>
              )}

              {/* Summary Container */}
              {resumeContent && (
                <div className="bg-meeting-surface-dark rounded-lg border border-secondary-700 shadow-lg">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-white flex items-center">
                        <span className="mr-2">📋</span>
                        Meeting Summary
                      </h3>
                      <div className="flex items-center space-x-2">
                        <select
                          value={summaryLanguage}
                          onChange={(e) => {
                            console.log(`Language changed to: ${getLanguageDisplayInfo(e.target.value)}`);
                            setSummaryLanguage(e.target.value);
                            // Regenerate summary with new language if we already have content
                            if (resumeContent && resumeContent !== 'Analyzing conversation...') {
                              generateResume();
                            }
                          }}
                          className="bg-meeting-panel-dark text-white rounded-lg px-2 py-1 text-sm border border-secondary-700 focus:ring-2 focus:ring-wolt-blue focus:border-transparent"
                        >
                          {languageOptions.map((lang: LanguageOption) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={downloadResume}
                          className="p-1.5 hover:bg-meeting-control-dark rounded-full transition-colors duration-200"
                        >
                          <Download className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={() => setResumeContent(null)}
                          className="p-1.5 hover:bg-meeting-control-dark rounded-full transition-colors duration-200"
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="text-white whitespace-pre-wrap text-sm bg-meeting-panel-dark p-4 rounded-lg border border-secondary-700/30 leading-relaxed">
                      {resumeContent === 'Analyzing conversation...' ? (
                        <div className="flex items-center justify-center py-8">
                          <span className="mr-2 animate-spin">⏳</span>
                          <span>Analyzing conversation...</span>
                        </div>
                      ) : (
                        resumeContent
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Chat Messages with added typewriter effect for AI responses
          chatMessages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 break-words ${
                message.role === 'user' 
                  ? 'bg-primary-500/80 text-white' 
                  : message.role === 'ai-typing' 
                    ? 'bg-meeting-surface-dark/80 text-white border border-secondary-700/50 shadow-md'
                    : 'bg-meeting-surface-dark/80 text-white border border-secondary-700/50 shadow-md'
              }`}>
                {message.role === 'ai-typing' ? (
                  <p className="text-sm break-words">
                    <TypewriterText text={message.content} />
                  </p>
                ) : (
                  <>
                    {message.role !== 'user' && (
                      <div className="flex items-center mb-1.5">
                        <span className="bg-primary-500/20 rounded-full p-1 mr-2">
                          {message.content.charAt(0)}
                        </span>
                        <span className="text-xs text-white/70">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm break-words leading-relaxed">{message.content}</p>
                  </>
                )}
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
                      className="absolute top-2 right-2 p-2 bg-meeting-surface-dark/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
      <div className="p-4 border-t border-secondary-700 bg-meeting-surface-dark/90">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode('chat')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
              currentMode === 'chat'
                ? 'bg-primary-500 text-white'
                : 'bg-meeting-control-dark text-white hover:bg-meeting-control-dark/70'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setMode('image')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
              currentMode === 'image'
                ? 'bg-primary-500 text-white'
                : 'bg-meeting-control-dark text-white hover:bg-meeting-control-dark/70'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Generate Image</span>
          </button>
          <button
            onClick={() => setMode('speech')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
              currentMode === 'speech'
                ? 'bg-primary-500 text-white'
                : 'bg-meeting-control-dark text-white hover:bg-meeting-control-dark/70'
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
                  ? 'bg-danger-500 hover:bg-danger-600'
                  : 'bg-primary-500 hover:bg-primary-600'
              } text-white font-medium`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span>{isListening ? "Stop Recording" : "Start Recording"}</span>
            </button>
            {speechMessages.length > 0 && (
              <button
                onClick={generateResume}
                className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium"
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
              className="flex-1 bg-meeting-control-dark text-white rounded-lg px-3 py-2 border border-secondary-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={currentMode === 'chat' ? sendMessage : generateImage}
              disabled={isGenerating}
              className="px-4 py-2 bg-primary-500 rounded-lg hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
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

// Helper function to get language name from code
const getLanguageName = (code: string): string => {
  const language = languageOptions.find(lang => lang.code === code);
  return language ? language.name : 'English';
};

// Add a function to help debug language selection
const getLanguageDisplayInfo = (code: string): string => {
  const language = languageOptions.find(lang => lang.code === code);
  if (!language) {
    return `Unknown (code: ${code})`;
  }
  return `${language.name} (${code})`;
};