import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface VideoPlayerProps {
  user: {
    uid: string | number;
    videoTrack?: any;
    audioTrack?: any;
    name?: string;
  };
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  user, 
  isLocal = false,
  isMuted,
  isVideoOff
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Determine if audio/video are enabled
  const isAudioEnabled = user.audioTrack && !isMuted;
  const isVideoEnabled = user.videoTrack && !isVideoOff;
  
  // Get display name with appropriate formatting
  const displayName = (() => {
    if (user.uid === 'screen') return 'Screen Share';
    if ('name' in user && user.name) {
      return isLocal ? `${user.name} (You)` : user.name;
    }
    return isLocal ? 'You' : `User ${user.uid}`;
  })();

  useEffect(() => {
    const videoTrack = user.videoTrack;
    if (videoTrack && ref.current) {
      // Use a small timeout to ensure the DOM is ready
      const timer = setTimeout(() => {
        try {
          videoTrack.play(ref.current);
        } catch (error) {
          console.error('Error playing video track:', error);
        }
      }, 100);
      
      return () => {
        clearTimeout(timer);
        try {
          if (videoTrack) {
            videoTrack.stop();
          }
        } catch (error) {
          console.error('Error stopping video track:', error);
        }
      };
    }
    
    return () => {
      try {
        if (videoTrack) {
          videoTrack.stop();
        }
      } catch (error) {
        console.error('Error stopping video track:', error);
      }
    };
  }, [user.videoTrack]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-slate-800">
      {/* Video container */}
      <div 
        ref={ref} 
        className="h-full w-full bg-slate-900"
        style={{ 
          display: isVideoEnabled ? 'block' : 'none' 
        }}
      />
      
      {/* Fallback when video is off */}
      {!isVideoEnabled && (
        <div className="flex h-full w-full items-center justify-center bg-slate-800">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-700 text-2xl font-semibold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      
      {/* Status indicators */}
      <div className="absolute top-2 right-2 flex space-x-2">
        <div className={`p-2 rounded-full ${!isAudioEnabled ? 'bg-red-500/80' : 'bg-slate-900/80'}`}>
          {isAudioEnabled ? (
            <Mic className="w-4 h-4 text-emerald-400" />
          ) : (
            <MicOff className="w-4 h-4 text-white" />
          )}
        </div>
        <div className={`p-2 rounded-full ${!isVideoEnabled ? 'bg-red-500/80' : 'bg-slate-900/80'}`}>
          {isVideoEnabled ? (
            <Video className="w-4 h-4 text-emerald-400" />
          ) : (
            <VideoOff className="w-4 h-4 text-white" />
          )}
        </div>
      </div>
      
      {/* User name display */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium truncate">{displayName}</span>
          {(isMuted || isVideoOff) && (
            <div className="flex items-center space-x-1">
              {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
              {isVideoOff && <VideoOff className="w-3 h-3 text-red-400" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};