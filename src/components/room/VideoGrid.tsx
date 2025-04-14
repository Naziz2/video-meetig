import React from 'react';
import { VideoPlayer } from '../VideoPlayer';
import { IMicrophoneAudioTrack, ICameraVideoTrack, ILocalVideoTrack } from 'agora-rtc-sdk-ng';

interface User {
  uid: string | number;
  videoTrack?: any;
  audioTrack?: any;
  name?: string;
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
  const getGridClass = () => {
    const totalUsers = users.length + 1;
    if (totalUsers === 1) return 'grid-cols-1';
    if (totalUsers === 2) return 'grid-cols-2';
    if (totalUsers <= 4) return 'grid-cols-2';
    if (totalUsers <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <div className={`grid ${getGridClass()} gap-4 h-full max-h-full`}>
      {isScreenSharing && screenTrack && (
        <div className="col-span-full row-span-2 h-full max-h-full">
          <VideoPlayer
            user={{ uid: 'screen' as any, videoTrack: screenTrack, audioTrack: null }}
            isLocal={true}
          />
        </div>
      )}
      {start && tracks && !isScreenSharing && (
        <div className="h-full max-h-full">
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
      {users.map((user) => (
        <div key={user.uid} className="h-full max-h-full">
          <VideoPlayer user={user} />
        </div>
      ))}
    </div>
  );
};
