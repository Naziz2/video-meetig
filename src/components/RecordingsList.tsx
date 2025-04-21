import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { Clock, Download, Calendar, User, Video } from 'lucide-react';

interface Recording {
  id: string;
  meeting_id: string | null;
  room_id: string;
  recorder_id: string;
  file_url: string;
  file_size: number;
  duration: number;
  format: string;
  created_at: string;
  meeting_title?: string;
  recorder_name?: string;
}

export const RecordingsList = () => {
  const { user } = useStore();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchRecordings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch recordings where the user is the recorder
        const { data, error: fetchError } = await supabase
          .from('recordings')
          .select(`
            *,
            meetings(title)
          `)
          .eq('recorder_id', user.id)
          .order('created_at', { ascending: false });
          
        if (fetchError) throw fetchError;
        
        // Process data to include meeting title
        const processedData = data.map((recording: any) => ({
          ...recording,
          meeting_title: recording.meetings?.title || 'Unnamed Meeting'
        }));
        
        setRecordings(processedData);
      } catch (err: any) {
        console.error('Error fetching recordings:', err);
        setError(err.message || 'Failed to load recordings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecordings();
  }, [user]);
  
  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Format duration to minutes and seconds
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Format date to readable format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="w-8 h-8 border-4 border-theme-button border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-gray-400">Loading recordings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>Error: {error}</p>
        <button 
          className="mt-2 px-4 py-2 bg-theme-button hover:bg-theme-button-hover text-white rounded-lg"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (recordings.length === 0) {
    return (
      <div className="p-6 text-center">
        <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">No Recordings Found</h3>
        <p className="text-gray-400">
          You haven't recorded any meetings yet. Start a meeting and use the recording feature to capture it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-semibold text-white mb-6">Your Recordings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recordings.map((recording) => (
          <div 
            key={recording.id} 
            className="bg-theme-card rounded-xl overflow-hidden border border-theme shadow-lg transition-transform hover:scale-[1.02]"
          >
            <div className="relative">
              <div className="aspect-video bg-slate-800 flex items-center justify-center">
                <video 
                  src={recording.file_url} 
                  className="w-full h-full object-cover" 
                  poster="/video-placeholder.jpg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <h3 className="font-medium truncate">{recording.meeting_title}</h3>
                    <div className="flex items-center text-sm text-gray-300 mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{formatDuration(recording.duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex items-center text-sm text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(recording.created_at)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-400">
                <User className="w-4 h-4 mr-2" />
                <span>Recorded by you</span>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-500">{formatFileSize(recording.file_size)}</span>
                
                <a 
                  href={recording.file_url} 
                  download={`recording-${recording.room_id}.${recording.format}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-3 py-1.5 bg-theme-button hover:bg-theme-button-hover text-white text-sm rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
