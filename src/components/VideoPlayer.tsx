import { IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface Props {
  user: IAgoraRTCRemoteUser | { uid: number; videoTrack: any; audioTrack: any };
  isLocal?: boolean;
}

export const VideoPlayer = ({ user, isLocal = false }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      user.videoTrack?.play(ref.current);
    }
    return () => {
      user.videoTrack?.stop();
    };
  }, [user.videoTrack]);

  return (
    <div className="relative rounded-lg overflow-hidden bg-slate-800 aspect-video border border-slate-700">
      <div ref={ref} className="h-full w-full object-cover" />
      <div className="absolute bottom-4 left-4 flex items-center space-x-2">
        <div className="bg-slate-900/80 p-2 rounded-full">
          {user.audioTrack ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-red-500" />}
        </div>
        <div className="bg-slate-900/80 p-2 rounded-full">
          {user.videoTrack ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-red-500" />}
        </div>
      </div>
    </div>
  );
};