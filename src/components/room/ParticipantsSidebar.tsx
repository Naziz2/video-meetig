import React from 'react';
import { Mic, MicOff, Video, VideoOff, X } from 'lucide-react';
import { IMicrophoneAudioTrack, ICameraVideoTrack } from 'agora-rtc-sdk-ng';

interface User {
  uid: string | number;
  videoTrack?: any;
  audioTrack?: any;
  name?: string;
}

interface ParticipantsSidebarProps {
  isVisible: boolean;
  users: User[];
  isMuted: boolean;
  isVideoOff: boolean;
  tracks: [IMicrophoneAudioTrack, ICameraVideoTrack] | null;
  onClose: () => void;
}

export const ParticipantsSidebar: React.FC<ParticipantsSidebarProps> = ({
  isVisible,
  users,
  isMuted,
  isVideoOff,
  tracks,
  onClose
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-secondary-100 dark:bg-secondary-800 p-4 z-20 border-l border-secondary-200 dark:border-secondary-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">Participants</h2>
        <button onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-2">
        {tracks && (
          <div className="flex items-center justify-between p-2 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded">
            <span>You (Host)</span>
            <div className="flex items-center space-x-2">
              {isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
              {isVideoOff ? <VideoOff className="w-4 h-4 text-red-500" /> : <Video className="w-4 h-4" />}
            </div>
          </div>
        )}
        {users.map((user) => (
          <div key={user.uid} className="flex items-center justify-between p-2 hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded">
            <span>{user.name || `Participant ${user.uid}`}</span>
            <div className="flex items-center space-x-2">
              {user.audioTrack ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-red-500" />}
              {user.videoTrack ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-red-500" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
