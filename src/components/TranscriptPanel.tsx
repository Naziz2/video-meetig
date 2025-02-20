import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, MessageSquare } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

interface Transcript {
  id: number;
  text: string;
  speaker: string;
  timestamp: string;
  roomId: string;
}

export const TranscriptPanel = () => {
  const { user, channel } = useStore();
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const transcriptsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    transcriptsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transcripts]);

  useEffect(() => {
    // Subscribe to new transcripts
    const subscription = supabase
      .channel('transcripts')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'transcripts',
        filter: `room_id=eq.${channel}`
      }, payload => {
        const newTranscript = payload.new as any;
        setTranscripts(prev => [...prev, {
          id: newTranscript.id,
          text: newTranscript.text,
          speaker: newTranscript.speaker,
          timestamp: new Date(newTranscript.created_at).toLocaleTimeString(),
          roomId: newTranscript.room_id
        }]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [channel]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ar-TN'; // Set language to Tunisian Arabic

        recognition.onstart = () => {
          console.log('Speech recognition started');
        };

        recognition.onresult = async (event: any) => {
          const last = event.results.length - 1;
          const text = event.results[last][0].transcript;

          if (event.results[last].isFinal) {
            const newTranscript = {
              text,
              speaker: user?.name || 'You',
              room_id: channel,
              created_at: new Date().toISOString()
            };

            // Save to Supabase
            await supabase.from('transcripts').insert([newTranscript]);
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          if (isListening) {
            recognition.start();
          }
        };

        setRecognition(recognition);
      }
    }
  }, [user?.name, isListening, channel]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          محادثة مباشرة
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {transcripts.length === 0 ? (
          <div className="text-slate-400 text-center py-4">
            انقر على الميكروفون باش تبدا تسجل
          </div>
        ) : (
          transcripts.map((transcript) => (
            <div key={transcript.id} className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-emerald-400">{transcript.speaker}</span>
                <span className="text-sm text-slate-400">{transcript.timestamp}</span>
              </div>
              <p className="text-slate-200">{transcript.text}</p>
            </div>
          ))
        )}
        <div ref={transcriptsEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-800">
        <button
          onClick={toggleListening}
          className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-emerald-600 hover:bg-emerald-700'
          } text-white transition-colors`}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>وقف التسجيل</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>ابدا التسجيل</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};