import React, { useEffect, useState } from 'react';
import { VideoPlayer } from '../VideoPlayer';
import { IMicrophoneAudioTrack, ICameraVideoTrack, ILocalVideoTrack } from 'agora-rtc-sdk-ng';

interface User {
  uid: string | number;
  videoTrack?: any;
  audioTrack?: any;
  name?: string;
  isScreenShare?: boolean;
}

// Extended user type with local flag for the focused view
interface ExtendedUser extends User {
  isLocal?: boolean;
}

interface VideoGridProps {
  users: User[];
  client: any;
  start: boolean;
  tracks: [IMicrophoneAudioTrack, ICameraVideoTrack] | null;
  screenTrack: ILocalVideoTrack | null;
  isScreenSharing: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  userName: string;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  users,
  client,
  start,
  tracks,
  screenTrack,
  isScreenSharing,
  isMuted,
  isVideoOff,
  userName
}) => {
  // State to track which user is currently focused (full-screen)
  const [focusedUser, setFocusedUser] = useState<ExtendedUser | null>(null);
  
  // Find any remote user who is screen sharing
  const remoteScreenShareUser = users.find(user => user.isScreenShare);

  // Check if there's an odd number of participants (including local user)
  const isOddParticipants = (users.length + 1) % 2 !== 0;
  // Check if the user is alone in the room
  const isAlone = users.length === 0;

  // Get grid class based on number of participants
  const getGridClass = () => {
    const totalUsers = users.length + 1;
    if (totalUsers === 1) return 'grid-cols-1';
    if (totalUsers === 2) return 'grid-cols-2';
    if (totalUsers <= 4) return 'grid-cols-2';
    if (totalUsers <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  // Debug screen sharing state
  useEffect(() => {
    console.log('VideoGrid rendering with screen sharing state:', {
      isLocalScreenSharing: isScreenSharing,
      hasLocalScreenTrack: !!screenTrack,
      hasRemoteScreenShare: !!remoteScreenShareUser,
      remoteScreenShareUserId: remoteScreenShareUser?.uid,
      allUsers: users.map(u => ({ uid: u.uid, isScreenShare: u.isScreenShare }))
    });
  }, [isScreenSharing, screenTrack, remoteScreenShareUser, users]);

  // Reset focused user when users change or screen sharing starts
  useEffect(() => {
    if (isScreenSharing || remoteScreenShareUser) {
      setFocusedUser(null);
    }
  }, [isScreenSharing, remoteScreenShareUser]);

  // Create the local user object
  const localUser: ExtendedUser = {
    uid: client?.uid || 'local',
    videoTrack: tracks?.[1],
    audioTrack: tracks?.[0],
    name: userName || 'You',
    isLocal: true
  };

  // Handle clicking on a video to focus it
  const handleVideoClick = (user: ExtendedUser) => {
    console.log('Video clicked:', user);
    if (focusedUser && focusedUser.uid === user.uid) {
      // If clicking the already focused user, unfocus
      setFocusedUser(null);
    } else {
      // Focus on the clicked user
      setFocusedUser(user);
    }
  };

  // Determine if any screen sharing is happening (local or remote)
  const isAnyScreenSharing = isScreenSharing || !!remoteScreenShareUser;
  
  // Get the active screen share track and info
  const activeScreenShare = isScreenSharing 
    ? { uid: 'screen', videoTrack: screenTrack, audioTrack: null, isLocal: true, name: 'Your Screen' }
    : remoteScreenShareUser 
      ? { ...remoteScreenShareUser, isLocal: false, name: `${remoteScreenShareUser.name || 'User'}'s Screen` }
      : null;

  // If any screen sharing is active, render a different layout with screen share as the main content
  if (isAnyScreenSharing && (screenTrack || (remoteScreenShareUser && remoteScreenShareUser.videoTrack))) {
    console.log('Rendering screen share layout with:', activeScreenShare);
    
    return (
      <div className="h-full max-h-full relative">
        {/* Main screen share display */}
        <div className="h-full w-full">
          <VideoPlayer
            user={{ 
              uid: activeScreenShare?.uid || 'screen', 
              videoTrack: activeScreenShare?.videoTrack, 
              audioTrack: activeScreenShare?.audioTrack,
              name: activeScreenShare?.name || 'Screen Share'
            }}
            isLocal={!!activeScreenShare?.isLocal}
          />
        </div>
        
        {/* Thumbnails container - positioned at the bottom */}
        <div className="absolute bottom-4 right-4 flex flex-row-reverse gap-2 z-30">
          {/* Local user thumbnail */}
          {start && tracks && (
            <div 
              className="w-32 h-24 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:border-2 hover:border-blue-500 transition-all"
              onClick={() => handleVideoClick(localUser)}
            >
              <VideoPlayer
                user={{ 
                  uid: client?.uid || 0, 
                  videoTrack: tracks[1], 
                  audioTrack: tracks[0],
                  name: userName || 'You'
                }}
                isLocal={true}
                isMuted={isMuted}
                isVideoOff={isVideoOff}
              />
            </div>
          )}
          
          {/* Remote users thumbnails - exclude the screen sharing user */}
          {users
            .filter(user => !user.isScreenShare)
            .map((user) => (
              <div 
                key={user.uid} 
                className="w-32 h-24 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:border-2 hover:border-blue-500 transition-all"
                onClick={() => handleVideoClick({...user, isLocal: false})}
              >
                <VideoPlayer user={user} />
              </div>
            ))
          }
        </div>
      </div>
    );
  }

  // If a user is focused, show them in full screen with others as thumbnails
  if (focusedUser) {
    return (
      <div className="h-full max-h-full relative">
        {/* Main focused user display */}
        <div className="h-full w-full">
          <VideoPlayer
            user={focusedUser}
            isLocal={focusedUser.isLocal}
            isMuted={focusedUser.isLocal ? isMuted : undefined}
            isVideoOff={focusedUser.isLocal ? isVideoOff : undefined}
          />
        </div>
        
        {/* Thumbnails container - positioned at the bottom */}
        <div className="absolute bottom-4 right-4 flex flex-row-reverse gap-2 z-30">
          {/* Show all users except the focused one */}
          {start && tracks && focusedUser.uid !== localUser.uid && (
            <div 
              className="w-32 h-24 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:border-2 hover:border-blue-500 transition-all"
              onClick={() => handleVideoClick(localUser)}
            >
              <VideoPlayer
                user={localUser}
                isLocal={true}
                isMuted={isMuted}
                isVideoOff={isVideoOff}
              />
            </div>
          )}
          
          {users
            .filter(user => user.uid !== focusedUser.uid)
            .map((user) => (
              <div 
                key={user.uid} 
                className="w-32 h-24 rounded-lg overflow-hidden shadow-lg cursor-pointer hover:border-2 hover:border-blue-500 transition-all"
                onClick={() => handleVideoClick({...user, isLocal: false})}
              >
                <VideoPlayer user={user} />
              </div>
            ))
          }
        </div>
      </div>
    );
  }

  // Regular grid layout when not screen sharing and no user is focused
  return (
    <div className={`grid ${getGridClass()} gap-4 h-full max-h-full relative`}>
      {/* Remote users */}
      {users.map((user) => (
        <div 
          key={user.uid} 
          className="h-full max-h-full cursor-pointer hover:border-2 hover:border-blue-500 transition-all"
          onClick={() => handleVideoClick({...user, isLocal: false})}
        >
          <VideoPlayer user={user} />
        </div>
      ))}
      
      {/* Local user video */}
      {start && tracks && (
        isAlone ? (
          // Full size when alone
          <div 
            className="h-full max-h-full col-span-full cursor-pointer hover:border-2 hover:border-blue-500 transition-all"
            onClick={() => handleVideoClick(localUser)}
          >
            <VideoPlayer
              user={localUser}
              isLocal={true}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
            />
          </div>
        ) : isOddParticipants ? (
          // Small corner video for odd number of participants
          <div 
            className="absolute bottom-4 right-4 w-1/4 h-1/4 z-10 cursor-pointer hover:border-2 hover:border-blue-500 transition-all"
            onClick={() => handleVideoClick(localUser)}
          >
            <VideoPlayer
              user={localUser}
              isLocal={true}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
            />
          </div>
        ) : (
          // Normal grid cell for even number of participants
          <div 
            className="h-full max-h-full cursor-pointer hover:border-2 hover:border-blue-500 transition-all"
            onClick={() => handleVideoClick(localUser)}
          >
            <VideoPlayer
              user={localUser}
              isLocal={true}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
            />
          </div>
        )
      )}
    </div>
  );
};
