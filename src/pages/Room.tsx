import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, ILocalVideoTrack } from 'agora-rtc-sdk-ng';
import { useStore } from '../store/useStore';
import { VideoPlayer } from '../components/VideoPlayer';
import { TranscriptPanel } from '../components/TranscriptPanel';
import { Mic, MicOff, Video, VideoOff, Share2, Users, Settings, X, MessageSquare, Monitor, Check } from 'lucide-react';
import { getUserName } from '../pages/Join';

// Helper function to get user name from localStorage with type safety
const getUserNameSafe = (userId: string | number): string => {
  return getUserName(String(userId));
};

export const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { appId, setCredentials, settings, user, updateSettings } = useStore();
  const [users, setUsers] = useState<any[]>([]);
  const [start, setStart] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [tracks, setTracks] = useState<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null);
  const [screenTrack, setScreenTrack] = useState<ILocalVideoTrack | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('ar-TN');
  const [videoQuality, setVideoQuality] = useState<'360p' | '720p' | '1080p'>(settings.videoQuality || '720p');
  const [isCopied, setIsCopied] = useState(false);

  const languageOptions = [
    { code: 'ar-TN', name: 'العربية التونسية' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'en-US', name: 'English' },
    { code: 'ar', name: 'العربية الفصحى' }
  ];

  const shareLink = `${window.location.origin}/join?room=${id}`;

  useEffect(() => {
    if (id) {
      setCredentials(appId, id, null);
      
      // Save the room ID to localStorage for persistence
      const saveRoomId = (roomId: string): void => {
        const roomIds = localStorage.getItem('roomIds');
        const existingRoomIds = roomIds ? JSON.parse(roomIds) : [];
        if (!existingRoomIds.includes(roomId)) {
          existingRoomIds.push(roomId);
          localStorage.setItem('roomIds', JSON.stringify(existingRoomIds));
        }
      };
      
      saveRoomId(id);
    }
  }, [id, appId, setCredentials]);

  const handleShare = () => {
    navigator.clipboard.writeText(shareLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleVideoQualityChange = (quality: '360p' | '720p' | '1080p') => {
    setVideoQuality(quality);
    updateSettings({ videoQuality: quality });
    
    // Restart video with new quality if tracks exist
    if (tracks && tracks[1]) {
      const videoTrack = tracks[1];
      if (videoTrack) {
        // Apply new constraints based on quality
        let constraints: MediaTrackConstraints = {};
        
        switch (quality) {
          case '360p':
            constraints = { width: 640, height: 360 };
            break;
          case '720p':
            constraints = { width: 1280, height: 720 };
            break;
          case '1080p':
            constraints = { width: 1920, height: 1080 };
            break;
        }
        
        // Apply constraints to the video track
        videoTrack.setEncoderConfiguration(constraints);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!client || !tracks) return;

    if (isScreenSharing && screenTrack) {
      try {
        await client.unpublish(screenTrack);
        screenTrack.close();
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
          encoderConfig: "1080p_2", // Use high quality preset
          optimizationMode: "detail" // Optimize for detail
        });

        if (Array.isArray(screenVideoTrack)) {
          // If screen sharing returns both video and audio tracks
          await client.publish(screenVideoTrack[0]);
          setScreenTrack(screenVideoTrack[0]);
        } else {
          // If screen sharing returns only video track
          await client.publish(screenVideoTrack);
          setScreenTrack(screenVideoTrack);
        }
        
        setIsScreenSharing(true);
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
        try {
          await client.subscribe(user, mediaType);
          
          if (mediaType === 'video') {
            setUsers(prevUsers => {
              const existingUser = prevUsers.find(u => u.uid === user.uid);
              if (existingUser) {
                return prevUsers.map(u => 
                  u.uid === user.uid 
                    ? { ...u, videoTrack: user.videoTrack, audioTrack: user.audioTrack, name: getUserNameSafe(user.uid) }
                    : u
                );
              }
              return [...prevUsers, {
                uid: user.uid,
                videoTrack: user.videoTrack,
                audioTrack: user.audioTrack,
                name: getUserNameSafe(user.uid)
              }];
            });
          }
          
          if (mediaType === 'audio') {
            if (user.audioTrack) {
              user.audioTrack.play();
            }
            setUsers(prevUsers => {
              const existingUser = prevUsers.find(u => u.uid === user.uid);
              if (existingUser) {
                return prevUsers.map(u => 
                  u.uid === user.uid 
                    ? { ...u, audioTrack: user.audioTrack, name: getUserNameSafe(user.uid) }
                    : u
                );
              }
              return [...prevUsers, {
                uid: user.uid,
                videoTrack: user.videoTrack,
                audioTrack: user.audioTrack,
                name: getUserNameSafe(user.uid)
              }];
            });
          }
        } catch (error) {
          console.error('Error on user-published:', error);
        }
      });

      client.on('user-unpublished', async (user, mediaType) => {
        try {
          await client.unsubscribe(user, mediaType);
          
          if (mediaType === 'audio') {
            if (user.audioTrack) {
              user.audioTrack.stop();
            }
          }
          
          if (mediaType === 'video') {
            setUsers(prevUsers => 
              prevUsers.map(u => 
                u.uid === user.uid 
                  ? { ...u, videoTrack: undefined }
                  : u
              )
            );
          }
        } catch (error) {
          console.error('Error on user-unpublished:', error);
        }
      });

      client.on('user-left', (user) => {
        setUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
      });

      try {
        await client.join(appId, channelName, null, user?.id || 'Anonymous');

        const videoConfig = {
          '360p': { 
            width: 640, 
            height: 360, 
            frameRate: 30, 
            bitrate: 600 
          },
          '720p': { 
            width: 1280, 
            height: 720, 
            frameRate: 30, 
            bitrate: 1500 
          },
          '1080p': { 
            width: 1920, 
            height: 1080, 
            frameRate: 30, 
            bitrate: 4000 
          }
        }[videoQuality];

        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          microphoneId: settings.audioInput !== 'default' ? settings.audioInput : undefined,
          encoderConfig: {
            sampleRate: 48000,
            stereo: true,
            bitrate: 128
          }
        });

        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          cameraId: settings.videoInput !== 'default' ? settings.videoInput : undefined,
          encoderConfig: {
            width: videoConfig.width,
            height: videoConfig.height,
            frameRate: videoConfig.frameRate,
            bitrateMin: undefined,
            bitrateMax: undefined
          }
        });

        localTracks = [audioTrack, videoTrack];
        setTracks(localTracks);
        await client.publish([audioTrack, videoTrack]);
        setStart(true);
      } catch (error) {
        console.error('Error joining channel:', error);
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
  }, [appId, id, settings, user, videoQuality]);

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
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-slate-700 text-white rounded-lg px-3 py-1.5 text-sm border border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {languageOptions.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <select
            value={videoQuality}
            onChange={(e) => handleVideoQualityChange(e.target.value as '360p' | '720p' | '1080p')}
            className="bg-slate-700 text-white rounded-lg px-3 py-1.5 text-sm border border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="360p">360p</option>
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700"
          >
            <Users className="w-4 h-4" />
            <span>{users.length + 1}</span>
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="fixed inset-0 pt-16 pb-20">
        <div className={`grid ${showChat ? 'grid-cols-4' : 'grid-cols-1'} h-full`}>
          <div className={`${showChat ? 'col-span-3' : 'col-span-1'} h-full p-4 overflow-hidden`}>
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
                      name: user?.name || 'You'
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
          </div>
          {showChat && (
            <div className="h-full pr-4 pt-4 pb-4 overflow-hidden">
              <div className="h-full bg-slate-800 rounded-lg">
                <TranscriptPanel selectedLanguage={selectedLanguage} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm p-4 border-t border-slate-700">
        <div className="flex justify-center space-x-4">
          <button
            onClick={async () => {
              if (tracks?.[0]) {
                const newState = !isMuted;
                await tracks[0].setEnabled(!newState);
                setIsMuted(newState);
              }
            }}
            className={`p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
            } text-white`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button
            onClick={async () => {
              if (tracks?.[1]) {
                const newState = !isVideoOff;
                await tracks[1].setEnabled(!newState);
                setIsVideoOff(newState);
              }
            }}
            className={`p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
            } text-white`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              isScreenSharing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-600'
            } text-white`}
          >
            <Monitor className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate('/settings', { state: { from: location.pathname } })}
            className="p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 bg-emerald-600 text-white"
          >
            <Settings className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 bg-red-600 text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="fixed right-0 top-0 h-full w-80 teams-sidebar p-4 z-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Participants</h2>
            <button onClick={() => setShowParticipants(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {start && tracks && (
              <div className="flex items-center justify-between p-2 hover:bg-slate-700 rounded">
                <span>{user?.name || 'You'}</span>
                <div className="flex items-center space-x-2">
                  {isMuted ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                  {isVideoOff ? <VideoOff className="w-4 h-4 text-red-500" /> : <Video className="w-4 h-4" />}
                </div>
              </div>
            )}
            {users.map((user) => (
              <div key={user.uid} className="flex items-center justify-between p-2 hover:bg-slate-700 rounded">
                <span>{user.name}</span>
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