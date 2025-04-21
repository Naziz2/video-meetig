import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface User {
  uid: string | number;
  videoTrack?: any;
  audioTrack?: any;
  name?: string;
}

interface VideoPlayerProps {
  user: User;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  user,
  isLocal = false,
  isMuted = false,
  isVideoOff = false
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

  // Flag to check if this is a screen share
  const isScreenShare = user.uid === 'screen';

  useEffect(() => {
    console.log('VideoPlayer mounting/updating:', { 
      uid: user.uid, 
      isScreenShare,
      hasVideoTrack: !!user.videoTrack 
    });

    const videoTrack = user.videoTrack;
    if (videoTrack && ref.current) {
      // Use a small timeout to ensure the DOM is ready
      const timer = setTimeout(() => {
        try {
          console.log('Playing video track for:', user.uid, 'isScreenShare:', isScreenShare);
          
          // First, ensure any existing track is properly stopped
          try {
            videoTrack.stop();
            // Clear any existing elements that might have been created
            if (ref.current) {
              while (ref.current.firstChild) {
                ref.current.removeChild(ref.current.firstChild);
              }
            }
          } catch (e) {
            // Ignore errors when stopping
            console.warn('Error stopping previous track:', e);
          }
          
          // Then play the track with appropriate settings
          const playOptions = { 
            fit: isScreenShare ? 'contain' : 'cover',
            mirror: isLocal && !isScreenShare // Mirror only local camera, not screen shares
          };
          
          console.log('Playing track with options:', playOptions);
          videoTrack.play(ref.current, playOptions);
          
          // For screen sharing, log success
          if (isScreenShare) {
            console.log('Screen share track playing successfully');
          }
        } catch (error) {
          console.error('Error playing video track:', error);
        }
      }, 100);
      
      return () => {
        clearTimeout(timer);
        try {
          if (videoTrack) {
            console.log('Stopping video track for:', user.uid);
            videoTrack.stop();
          }
        } catch (error) {
          console.error('Error stopping video track:', error);
        }
      };
    }
    
    return () => {
      try {
        if (user.videoTrack) {
          console.log('Cleanup: Stopping video track for:', user.uid);
          user.videoTrack.stop();
        }
      } catch (error) {
        console.error('Error stopping video track:', error);
      }
    };
  }, [user.videoTrack, isLocal, isScreenShare, user.uid]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-slate-800">
      {/* Video container */}
      <div 
        ref={ref} 
        className="h-full w-full bg-slate-900"
        style={{ 
          display: isVideoEnabled ? 'block' : 'none',
          position: 'relative', // Ensure proper positioning
          // Special styles for screen sharing
          ...(isScreenShare ? { 
            backgroundColor: '#000',
            objectFit: 'contain'
          } : {})
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
        {!isScreenShare && (
          <div className={`p-2 rounded-full ${!isAudioEnabled ? 'bg-red-500/80' : 'bg-slate-900/80'}`}>
            {isAudioEnabled ? (
              <Mic className="w-4 h-4 text-emerald-400" />
            ) : (
              <MicOff className="w-4 h-4 text-white" />
            )}
          </div>
        )}
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
          {!isScreenShare && (isMuted || isVideoOff) && (
            <div className="flex items-center space-x-1">
              {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
              {isVideoOff && <VideoOff className="w-3 h-3 text-red-400" />}
            </div>
          )}
        </div>
      </div>
      
      {/* Clickable indicator - subtle hint that this is clickable */}
      <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-sm rounded-full p-1 opacity-70 hover:opacity-100 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </svg>
      </div>
    </div>
  );
};