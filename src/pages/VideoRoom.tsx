import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { useStore } from '../store/useStore';
import { VideoPlayer } from '../components/VideoPlayer';
import { TranscriptPanel } from '../components/TranscriptPanel';
import { ControlPanel } from '../components/ControlPanel';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export const VideoRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user, appId, setChannel } = useStore();
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [localTracks, setLocalTracks] = useState<{
    videoTrack: ICameraVideoTrack | null;
    audioTrack: IMicrophoneAudioTrack | null;
  }>({
    videoTrack: null,
    audioTrack: null,
  });
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedLanguage] = useState('en-US');

  useEffect(() => {
    if (roomId) {
      setChannel(roomId);
    }
  }, [roomId, setChannel]);

  useEffect(() => {
    const init = async () => {
      const agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      setClient(agoraClient);

      try {
        await agoraClient.join(appId, roomId || '', null, user?.id || '');

        const [audioTrack, videoTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack(),
          AgoraRTC.createCameraVideoTrack()
        ]);

        await agoraClient.publish([audioTrack, videoTrack]);
        setLocalTracks({ audioTrack, videoTrack });

        agoraClient.on('user-published', async (user, mediaType) => {
          await agoraClient.subscribe(user, mediaType);
          if (mediaType === 'video') {
            setUsers(prevUsers => {
              // Only add the user if they're not already in the list
              if (!prevUsers.some(u => u.uid === user.uid)) {
                return [...prevUsers, user];
              }
              return prevUsers;
            });
          }
          if (mediaType === 'audio') {
            user.audioTrack?.play();
          }
        });

        agoraClient.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'video') {
            setUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
          }
        });

        agoraClient.on('user-left', (user) => {
          setUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
        });
      } catch (error) {
        console.error('Error joining video call:', error);
      }
    };

    if (roomId && user?.id) {
      init();
    }

    // Cleanup function
    return () => {
      cleanupAndLeave();
    };
  }, [roomId, user?.id, appId]);

  // Separate cleanup function to ensure consistent cleanup logic
  const cleanupAndLeave = async () => {
    try {
      if (localTracks.audioTrack) {
        localTracks.audioTrack.close();
      }
      
      if (localTracks.videoTrack) {
        localTracks.videoTrack.close();
      }
      
      if (client) {
        await client.leave();
      }
      
      setLocalTracks({
        audioTrack: null,
        videoTrack: null
      });
      
      setUsers([]);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  const toggleAudio = async () => {
    if (localTracks.audioTrack) {
      if (isAudioMuted) {
        await localTracks.audioTrack.setEnabled(true);
      } else {
        await localTracks.audioTrack.setEnabled(false);
      }
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = async () => {
    if (localTracks.videoTrack) {
      if (isVideoOff) {
        await localTracks.videoTrack.setEnabled(true);
      } else {
        await localTracks.videoTrack.setEnabled(false);
      }
      setIsVideoOff(!isVideoOff);
    }
  };

  const leaveCall = async () => {
    try {
      await cleanupAndLeave();
      navigate('/');
    } catch (error) {
      console.error('Error leaving call:', error);
      // Force navigation even if there's an error
      navigate('/');
    }
  };

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  // Calculate grid columns based on number of participants
  const getGridColumns = () => {
    const totalParticipants = (localTracks.videoTrack ? 1 : 0) + users.length;
    if (totalParticipants <= 1) return 'grid-cols-1';
    if (totalParticipants <= 4) return 'grid-cols-1 md:grid-cols-2';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  return (
    <div className="meeting-container h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="meeting-header flex justify-between items-center">
        <button
          onClick={leaveCall}
          className="flex items-center text-secondary-700 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Leave Meeting</span>
        </button>
        
        <button
          onClick={togglePanel}
          className={`meeting-control-button ${
            isPanelOpen ? 'meeting-control-button-active' : 'meeting-control-button-inactive'
          }`}
          title={isPanelOpen ? "Close transcript" : "Open transcript"}
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video grid */}
        <div className={`flex-1 p-4 ${isPanelOpen ? 'w-full lg:w-3/4' : 'w-full'} transition-all duration-300`}>
          <div className={`grid ${getGridColumns()} gap-4 h-full`}>
            {localTracks.videoTrack && (
              <div className="video-container">
                <VideoPlayer
                  user={{
                    uid: user?.id || '',
                    videoTrack: localTracks.videoTrack,
                    audioTrack: localTracks.audioTrack || undefined,
                    name: user?.name
                  }}
                  isLocal={true}
                  isMuted={isAudioMuted}
                  isVideoOff={isVideoOff}
                />
                <div className="video-label">
                  {user?.name || 'You'} (You)
                </div>
              </div>
            )}
            
            {users.map(user => (
              <div key={user.uid} className="video-container">
                <VideoPlayer user={user} />
                <div className="video-label">
                  {user.name || `User ${user.uid}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transcript panel - sliding panel */}
        <div 
          className={`meeting-panel fixed lg:relative right-0 top-[60px] lg:top-0 h-[calc(100%-120px)] lg:h-auto w-full sm:w-96 shadow-xl transition-transform duration-300 z-10 ${
            isPanelOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0'
          }`}
        >
          <div className="h-full overflow-hidden">
            <TranscriptPanel selectedLanguage={selectedLanguage} />
          </div>
        </div>
      </div>

      {/* Control panel */}
      <footer className="meeting-footer flex justify-center items-center">
        <ControlPanel
          isAudioMuted={isAudioMuted}
          isVideoOff={isVideoOff}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          leaveCall={leaveCall}
          toggleSettings={togglePanel}
        />
      </footer>
    </div>
  );
};
