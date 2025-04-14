import React from 'react';
import { Mic, MicOff, Video, VideoOff, Settings, X, Monitor, Disc2 } from 'lucide-react';

interface ControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isRecording: boolean;
  onMuteToggle: () => void;
  onVideoToggle: () => void;
  onScreenShareToggle: () => void;
  onRecordToggle: () => void;
  onLeave: () => void;
  onSettingsOpen: () => void;
  recordingStatus?: string;
}

export const Controls: React.FC<ControlsProps> = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isRecording,
  onMuteToggle,
  onVideoToggle,
  onScreenShareToggle,
  onRecordToggle,
  onLeave,
  onSettingsOpen,
  recordingStatus
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm p-4 border-t border-slate-700">
      <div className="flex justify-center space-x-4">
        <button
          onClick={onMuteToggle}
          className={`p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
          } text-white`}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        <button
          onClick={onVideoToggle}
          className={`p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
          } text-white`}
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>
        <button
          onClick={onScreenShareToggle}
          className={`p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
            isScreenSharing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-600'
          } text-white`}
        >
          <Monitor className="w-6 h-6" />
        </button>
        <button
          id="recordButton"
          onClick={onRecordToggle}
          className={`p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
            isRecording ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
          } text-white`}
        >
          <Disc2 className="w-6 h-6" />
        </button>
        <button
          onClick={onSettingsOpen}
          className="p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 bg-emerald-600 text-white"
        >
          <Settings className="w-6 h-6" />
        </button>
        <button
          onClick={onLeave}
          className="p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 bg-red-600 text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <div id="recordingStatus" className="text-center mt-2 text-white">{recordingStatus}</div>
    </div>
  );
};
