import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IScreenVideoTrack } from 'agora-rtc-sdk-ng';
import { useStore } from '../store/useStore';
import { VideoPlayer } from '../components/VideoPlayer';
import { TranscriptPanel } from '../components/TranscriptPanel';
import { Mic, MicOff, Video, VideoOff, Share2, Users, Settings, X, MessageSquare, Monitor } from 'lucide-react';

export const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { appId, setCredentials, settings } = useStore();
  const [users, setUsers] = useState<any[]>([]);
  const [start, setStart] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [tracks, setTracks] = useState<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null);
  const [screenTrack, setScreenTrack] = useState<IScreenVideoTrack | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const shareLink = `${window.location.origin}/join?room=${id}`;

  useEffect(() => {
    if (id) {
      setCredentials(appId, id, null);
    }
  }, [id, appId, setCredentials]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      alert('Meeting link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleScreenShare = async () => {
    if (!client || !tracks) return;

    if (isScreenSharing && screenTrack) {
      try {
        await client.unpublish(screenTrack);
        await screenTrack.close();
        await client.publish(tracks[1]); // Republish camera
        setScreenTrack(null);
        setIsScreenSharing(false);
      } catch (error) {
        console.error('Error stopping screen share:', error);
      }
    } else {
      try {
        await client.unpublish(tracks[1]); // Unpublish camera first
        
        const screenVideoTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: {
            width: 1920,
            height: 1080,
            frameRate: 30,
            bitrateMax: 5000
          }
        }, "disable");
        
        await client.publish(screenVideoTrack);
        setScreenTrack(screenVideoTrack);
        setIsScreenSharing(true);

        // Handle when user stops sharing through browser controls
        screenVideoTrack.on('track-ended', async () => {
          await client.unpublish(screenVideoTrack);
          await screenVideoTrack.close();
          await client.publish(tracks[1]); // Republish camera
          setScreenTrack(null);
          setIsScreenSharing(false);
        });
      } catch (error) {
        console.error('Error sharing screen:', error);
        // If screen sharing fails, ensure camera is republished
        try {
          await client.publish(tracks[1]);
        } catch (e) {
          console.error('Error republishing camera:', e);
        }
      }
    }
  };

  useEffect(() => {
    let localTracks: [IMicrophoneAudioTrack, ICameraVideoTrack] | null = null;
    
    const client = AgoraRTC.createClient({ 
      mode: 'rtc', 
      codec: 'vp8',
      role: 'host'
    });
    setClient(client);

    const init = async (channelName: string) => {
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          setUsers((prevUsers) => {
            if (prevUsers.find(u => u.uid === user.uid)) {
              return prevUsers.map(u => u.uid === user.uid ? user : u);
            }
            return [...prevUsers, user];
          });
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'audio') {
          user.audioTrack?.stop();
        }
        if (mediaType === 'video') {
          setUsers((prevUsers) => prevUsers.filter((User) => User.uid !== user.uid));
        }
      });

      client.on('user-left', (user) => {
        setUsers((prevUsers) => prevUsers.filter((User) => User.uid !== user.uid));
      });

      try {
        await client.join(appId, channelName, null);

        const videoConfig = {
          '360p': { width: 640, height: 360, frameRate: 15, bitrate: 400 },
          '720p': { width: 1280, height: 720, frameRate: 30, bitrate: 1500 },
          '1080p': { width: 1920, height: 1080, frameRate: 60, bitrate: 4000 }
        }[settings.videoQuality];

        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          deviceId: settings.audioInput !== 'default' ? settings.audioInput : undefined,
          encoderConfig: {
            sampleRate: 48000,
            stereo: true,
            bitrate: 128
          }
        });

        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          deviceId: settings.videoInput !== 'default' ? settings.videoInput : undefined,
          encoderConfig: {
            ...videoConfig,
            bitrateMin: videoConfig.bitrate * 0.7,
            bitrateMax: videoConfig.bitrate * 1.3
          }
        });

        localTracks = [audioTrack, videoTrack];
        setTracks(localTracks);
        await client.publish([audioTrack, videoTrack]);
        setStart(true);
      } catch (error) {
        console.log('error', error);
      }
    };

    if (client && id) {
      init(id);
    }

    return () => {
      if (client) {
        client.leave();
        client.removeAllListeners();
        if (localTracks) {
          localTracks[0].close();
          localTracks[1].close();
        }
        if (screenTrack) {
          screenTrack.close();
        }
      }
    };
  }, [appId, id, settings]);

  const getGridClass = () => {
    const totalUsers = users.length + 1;
    if (totalUsers === 1) return 'grid-cols-1';
    if (totalUsers === 2) return 'grid-cols-2';
    if (totalUsers <= 4) return 'grid-cols-2';
    if (totalUsers <= 6) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm text-white p-4 flex items-center justify-between z-10 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-slate-100">Meeting: {id}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600"
          >
            <Users className="w-4 h-4" />
            <span>{users.length + 1}</span>
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="fixed inset-0 pt-16 pb-20">
        <div className={`grid ${showChat ? 'grid-cols-4 gap-4' : 'grid-cols-1'} h-full p-4`}>
          <div className={`${showChat ? 'col-span-3' : 'col-span-1'} h-full`}>
            <div className={`grid ${getGridClass()} gap-4 h-full`}>
              {isScreenSharing && screenTrack && (
                <div className="col-span-full row-span-2 max-h-[calc(100vh-9rem)]">
                  <VideoPlayer
                    user={{ uid: 'screen', videoTrack: screenTrack, audioTrack: null }}
                    isLocal={true}
                  />
                </div>
              )}
              {start && tracks && !isScreenSharing && (
                <VideoPlayer
                  user={{ uid: client?.uid || 0, videoTrack: tracks[1], audioTrack: tracks[0] }}
                  isLocal={true}
                />
              )}
              {users.map((user) => (
                <VideoPlayer key={user.uid} user={user} />
              ))}
            </div>
          </div>
          {showChat && (
            <div className="h-full bg-slate-800 rounded-lg overflow-hidden">
              <TranscriptPanel />
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm p-4 border-t border-slate-700">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              tracks?.[0].setEnabled(!isMuted);
              setIsMuted(!isMuted);
            }}
            className={`p-4 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-700 text-white'} hover:opacity-90`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button
            onClick={() => {
              tracks?.[1].setEnabled(!isVideoOff);
              setIsVideoOff(!isVideoOff);
            }}
            className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-700 text-white'} hover:opacity-90`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full ${isScreenSharing ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-white'} hover:opacity-90`}
          >
            <Monitor className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate('/settings', { state: { from: location.pathname } })}
            className="p-4 rounded-full bg-slate-700 text-white hover:bg-slate-600"
          >
            <Settings className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="fixed right-0 top-0 h-full w-80 bg-slate-800/95 backdrop-blur-sm shadow-lg p-4 z-20 text-white border-l border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Participants</h2>
            <button onClick={() => setShowParticipants(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {start && tracks && (
              <div className="flex items-center justify-between p-2 hover:bg-slate-700 rounded">
                <span>You (Host)</span>
                <div className="flex items-center space-x-2">
                  {isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                  {isVideoOff ? <VideoOff className="w-4 h-4 text-red-500" /> : <Video className="w-4 h-4" />}
                </div>
              </div>
            )}
            {users.map((user) => (
              <div key={user.uid} className="flex items-center justify-between p-2 hover:bg-slate-700 rounded">
                <span>Participant {user.uid}</span>
                <div className="flex items-center space-x-2">
                  {user.audioTrack ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-red-500" />}
                  {user.videoTrack ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-red-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};