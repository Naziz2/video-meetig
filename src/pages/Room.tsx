import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser, IRemoteAudioTrack, ICameraVideoTrack, IMicrophoneAudioTrack, ILocalVideoTrack } from 'agora-rtc-sdk-ng';
import { Mic, MicOff, Video, VideoOff, X, Settings, Monitor, Share2, Check, Users, MessageSquare, Crown } from 'lucide-react';
import { useStore } from '../store/useStore';
import { VideoPlayer } from '../components/VideoPlayer';
import { TranscriptPanel } from '../components/TranscriptPanel';
import { LanguageOption, languageOptions } from '../utils/languageOptions';

// Add a type for user with active speaker status
interface ExtendedUser extends IAgoraRTCRemoteUser {
  name?: string;
  isActiveSpeaker?: boolean;
  audioLevel?: number;
  hasAudio: boolean;
  hasVideo: boolean;
  isCreator?: boolean;
}

export const Room = () => {
  const { id } = useParams();
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [start, setStart] = useState<boolean>(false);
  const [tracks, setTracks] = useState<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [showParticipants, setShowParticipants] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [screenTrack, setScreenTrack] = useState<ILocalVideoTrack | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [videoQuality, setVideoQuality] = useState<'360p' | '480p' | '720p' | '1080p'>('720p');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { user, appId, settings } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const client = useRef<IAgoraRTCClient | null>(null);
  const [localActiveSpeaker, setLocalActiveSpeaker] = useState<boolean>(false);
  const activeSpeakerCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const audioLevelThreshold = 0.15; // Increased threshold to filter out background noise
  const consecutiveFramesThreshold = 3; // Number of consecutive frames needed to trigger active speaker
  const consecutiveFramesRef = useRef<Record<string, number>>({});
  const previousAudioLevelsRef = useRef<Record<string, number[]>>({});
  const audioSamplesCount = 5; // Number of audio samples to keep for analysis
  const [isCreator, setIsCreator] = useState<boolean>(false);

  // Initialize Agora client
  useEffect(() => {
    client.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    
    return () => {
      if (client.current) {
        client.current.leave();
      }
    };
  }, []);

  // Handle active speaker detection
  useEffect(() => {
    if (!tracks || !tracks[0]) return;
    
    // Function to check audio levels
    const checkActiveSpeaker = async () => {
      try {
        // Check local user audio level
        const localAudioLevel = tracks[0].getVolumeLevel();
        
        // Store audio samples for analysis
        if (!previousAudioLevelsRef.current['local']) {
          previousAudioLevelsRef.current['local'] = [];
        }
        
        const localSamples = previousAudioLevelsRef.current['local'];
        localSamples.push(localAudioLevel);
        
        // Keep only the last N samples
        if (localSamples.length > audioSamplesCount) {
          localSamples.shift();
        }
        
        // Calculate variance to detect speech patterns (speech has higher variance than constant noise)
        const localVariance = calculateVariance(localSamples);
        const isLocalSpeaking = localAudioLevel > audioLevelThreshold && localVariance > 0.005 && !isMuted;
        
        // Count consecutive frames where speech is detected
        if (isLocalSpeaking) {
          consecutiveFramesRef.current['local'] = (consecutiveFramesRef.current['local'] || 0) + 1;
        } else {
          consecutiveFramesRef.current['local'] = 0;
        }
        
        // Only set as active speaker if we have enough consecutive frames
        setLocalActiveSpeaker(consecutiveFramesRef.current['local'] >= consecutiveFramesThreshold);
        
        // Update remote users' audio levels
        setUsers(prevUsers => 
          prevUsers.map(user => {
            if (user.audioTrack) {
              const audioTrack = user.audioTrack as IRemoteAudioTrack;
              const audioLevel = audioTrack.getVolumeLevel();
              const userId = user.uid.toString();
              
              // Store audio samples for analysis
              if (!previousAudioLevelsRef.current[userId]) {
                previousAudioLevelsRef.current[userId] = [];
              }
              
              const samples = previousAudioLevelsRef.current[userId];
              samples.push(audioLevel);
              
              // Keep only the last N samples
              if (samples.length > audioSamplesCount) {
                samples.shift();
              }
              
              // Calculate variance to detect speech patterns
              const variance = calculateVariance(samples);
              const isSpeaking = audioLevel > audioLevelThreshold && variance > 0.005;
              
              // Count consecutive frames where speech is detected
              if (isSpeaking) {
                consecutiveFramesRef.current[userId] = (consecutiveFramesRef.current[userId] || 0) + 1;
              } else {
                consecutiveFramesRef.current[userId] = 0;
              }
              
              // Only set as active speaker if we have enough consecutive frames
              return {
                ...user,
                isActiveSpeaker: consecutiveFramesRef.current[userId] >= consecutiveFramesThreshold,
                audioLevel
              } as ExtendedUser;
            }
            return { ...user, isActiveSpeaker: false, audioLevel: 0 } as ExtendedUser;
          })
        );
      } catch (error) {
        console.error("Error checking active speaker:", error);
      }
    };
    
    // Helper function to calculate variance of an array of numbers
    const calculateVariance = (array: number[]): number => {
      if (array.length <= 1) return 0;
      
      // Calculate mean
      const mean = array.reduce((sum, val) => sum + val, 0) / array.length;
      
      // Calculate variance
      const variance = array.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / array.length;
      
      return variance;
    };
    
    // Set up interval to check audio levels
    activeSpeakerCheckInterval.current = setInterval(checkActiveSpeaker, 200);
    
    return () => {
      if (activeSpeakerCheckInterval.current) {
        clearInterval(activeSpeakerCheckInterval.current);
      }
    };
  }, [tracks, isMuted]);

  // Check if current user is the creator when component mounts
  useEffect(() => {
    // Get the roomCreators data from localStorage
    const roomCreatorsData = localStorage.getItem('roomCreators');
    const roomCreators = roomCreatorsData ? JSON.parse(roomCreatorsData) : {};
    
    // Check if the current user is the creator of this room
    if (user?.id && id && roomCreators[id] === user.id) {
      setIsCreator(true);
    }
  }, [user?.id, id]);

  useEffect(() => {
    const init = async (channelName: string) => {
      try {
        if (!client.current) return;
        
        client.current.on('user-published', async (user, mediaType) => {
          try {
            await client.current?.subscribe(user, mediaType);
            
            if (mediaType === 'video') {
              setUsers(prevUsers => {
                const existingUser = prevUsers.find(u => u.uid === user.uid);
                if (existingUser) {
                  return prevUsers.map(u => 
                    u.uid === user.uid 
                      ? { ...u, videoTrack: user.videoTrack, audioTrack: user.audioTrack }
                      : u
                  );
                }
                // Get user name from localStorage or use a default
                const userName = localStorage.getItem(`user_${user.uid}`) || `User ${Math.floor(Math.random() * 1000)}`;
                localStorage.setItem(`user_${user.uid}`, userName);
                
                // Check if this user is the creator
                const roomCreatorsData = localStorage.getItem('roomCreators');
                const roomCreators = roomCreatorsData ? JSON.parse(roomCreatorsData) : {};
                const isUserCreator = roomCreators[channelName] === user.uid;
                
                return [...prevUsers, {
                  ...user,
                  name: userName,
                  hasAudio: !!user.audioTrack,
                  hasVideo: !!user.videoTrack,
                  isCreator: isUserCreator
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
                      ? { ...u, audioTrack: user.audioTrack }
                      : u
                  );
                }
                // Get user name from localStorage or use a default
                const userName = localStorage.getItem(`user_${user.uid}`) || `User ${Math.floor(Math.random() * 1000)}`;
                localStorage.setItem(`user_${user.uid}`, userName);
                
                // Check if this user is the creator
                const roomCreatorsData = localStorage.getItem('roomCreators');
                const roomCreators = roomCreatorsData ? JSON.parse(roomCreatorsData) : {};
                const isUserCreator = roomCreators[channelName] === user.uid;
                
                return [...prevUsers, {
                  ...user,
                  name: userName,
                  hasAudio: !!user.audioTrack,
                  hasVideo: !!user.videoTrack,
                  isCreator: isUserCreator
                }];
              });
            }
          } catch (error) {
            console.error('Error on user-published:', error);
          }
        });

        client.current.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'video') {
            setUsers(prevUsers => {
              return prevUsers.map(u => 
                u.uid === user.uid ? { ...u, videoTrack: undefined } as ExtendedUser : u
              );
            });
          }
          if (mediaType === 'audio') {
            setUsers(prevUsers => {
              return prevUsers.map(u => 
                u.uid === user.uid ? { ...u, audioTrack: undefined, isActiveSpeaker: false } as ExtendedUser : u
              );
            });
          }
        });

        client.current.on('user-left', (user) => {
          console.log('User left:', user.uid);
          setUsers(prevUsers => {
            return prevUsers.filter(u => u.uid !== user.uid);
          });
        });

        client.current.on('user-info-updated', (uid, msg) => {
          if (msg === 'mute-audio' || msg === 'unmute-audio') {
            setUsers(prevUsers => {
              return prevUsers.map(u => {
                if (u.uid === uid) {
                  const isActive = msg === 'unmute-audio' && u.audioLevel !== undefined && u.audioLevel > audioLevelThreshold;
                  return { ...u, isActiveSpeaker: isActive } as ExtendedUser;
                }
                return u;
              });
            });
          }
        });

        // Join the channel
        const uid = await client.current.join(
          appId,
          channelName,
          null,
          user?.id || Math.floor(Math.random() * 100000)
        );
        
        console.log('Joined channel with UID:', uid);

        // Save the local user's name
        if (user?.name) {
          localStorage.setItem(`user_${uid}`, user.name);
        }

        // If this is the creator, mark them as such
        if (isCreator) {
          // Store the creator information for this room
          const roomCreatorsData = localStorage.getItem('roomCreators');
          const roomCreators = roomCreatorsData ? JSON.parse(roomCreatorsData) : {};
          roomCreators[channelName] = uid;
          localStorage.setItem('roomCreators', JSON.stringify(roomCreators));
          
          // Broadcast creator status through RTM or a custom attribute
          // This would require additional implementation with RTM
        }

        // Create local tracks
        const videoConfig = {
          '360p': { width: 640, height: 360 },
          '480p': { width: 640, height: 480 },
          '720p': { width: 1280, height: 720 },
          '1080p': { width: 1920, height: 1080 }
        }[videoQuality];

        try {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
            microphoneId: settings?.audioInput !== 'default' ? settings.audioInput : undefined
          });

          const videoTrack = await AgoraRTC.createCameraVideoTrack({
            cameraId: settings?.videoInput !== 'default' ? settings.videoInput : undefined,
            encoderConfig: videoConfig
          });
          
          // Publish tracks to the channel
          await client.current.publish([audioTrack, videoTrack]);
          console.log('Published local tracks successfully');
          
          // Set tracks in state
          setTracks([audioTrack, videoTrack]);
          setStart(true);
        } catch (error) {
          console.error('Error creating local tracks:', error);
          // Try to join with just audio if video fails
          try {
            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            await client.current.publish([audioTrack]);
            setTracks([audioTrack, null as any]);
            setIsVideoOff(true);
            setStart(true);
            console.log('Published audio-only due to video error');
          } catch (audioError) {
            console.error('Failed to create audio track as fallback:', audioError);
          }
        }
      } catch (error) {
        console.error('Error initializing:', error);
      }
    };

    if (id) {
      init(id);
    }

    return () => {
      if (tracks) {
        tracks[0]?.close();
        tracks[1]?.close();
      }
      if (screenTrack) {
        screenTrack.close();
      }
      if (client.current) {
        client.current.removeAllListeners();
        client.current.leave();
      }
    };
  }, [id, user, appId, settings, videoQuality, isCreator]);

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join?room=${id}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleVideoQualityChange = (quality: '360p' | '480p' | '720p' | '1080p') => {
    setVideoQuality(quality);
    
    // Restart video with new quality if tracks exist
    if (tracks && tracks[1]) {
      (async () => {
        try {
          // Create constraints based on quality
          let constraints;
        switch (quality) {
          case '360p':
            constraints = { width: 640, height: 360 };
            break;
            case '480p':
              constraints = { width: 640, height: 480 };
            break;
          case '720p':
            constraints = { width: 1280, height: 720 };
            break;
          case '1080p':
            constraints = { width: 1920, height: 1080 };
            break;
            default:
              constraints = { width: 1280, height: 720 };
          }
          
          // Close old track
          await client.current?.unpublish(tracks[1]);
          tracks[1].close();
          
          // Create new track with updated quality
          const newVideoTrack = await AgoraRTC.createCameraVideoTrack({
            cameraId: settings?.videoInput !== 'default' ? settings.videoInput : undefined,
            encoderConfig: constraints
          });
          
          // Publish new track
          await client.current?.publish(newVideoTrack);
          
          // Update tracks state
          setTracks([tracks[0], newVideoTrack]);
        } catch (error) {
          console.error('Error changing video quality:', error);
        }
      })();
    }
  };

  const toggleScreenShare = async () => {
    if (!client.current || !tracks) return;

    if (isScreenSharing && screenTrack) {
      try {
        await client.current.unpublish(screenTrack);
        screenTrack.close();
        await client.current.publish(tracks[1]); // Republish camera
        setScreenTrack(null);
        setIsScreenSharing(false);
      } catch (error) {
        console.error('Error stopping screen share:', error);
      }
    } else {
      try {
        await client.current.unpublish(tracks[1]); // Unpublish camera first
        
        const screenVideoTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: "1080p_2", // Use high quality preset
        }, "disable");

        if (Array.isArray(screenVideoTrack)) {
          // If screen sharing returns both video and audio tracks
          await client.current.publish(screenVideoTrack[0]);
          setScreenTrack(screenVideoTrack[0]);
        } else {
          // If screen sharing returns only video track
          await client.current.publish(screenVideoTrack);
          setScreenTrack(screenVideoTrack);
        }
        
        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error sharing screen:', error);
        // If screen sharing fails, ensure camera is republished
        try {
          await client.current.publish(tracks[1]);
        } catch (e) {
          console.error('Error republishing camera:', e);
        }
      }
    }
  };

  const getGridClass = () => {
    const totalUsers = users.length + 1;
    if (totalUsers === 1) return 'grid-cols-1';
    if (totalUsers === 2) return 'grid-cols-1 md:grid-cols-2';
    if (totalUsers <= 4) return 'grid-cols-2';
    if (totalUsers <= 6) return 'grid-cols-2 md:grid-cols-3';
    if (totalUsers <= 9) return 'grid-cols-3';
    if (totalUsers <= 12) return 'grid-cols-3 md:grid-cols-4';
    return 'grid-cols-4';
  };

  return (
    <div className="min-h-screen bg-meeting-background-dark">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-meeting-surface-dark/95 backdrop-blur-sm text-white p-4 flex items-center justify-between z-10 border-b border-secondary-700 shadow-md">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-white flex items-center">
            <span className="hidden sm:inline">Meeting:</span> 
            <span className="ml-2 px-3 py-1 bg-primary-500/20 rounded-md">{id}</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden md:flex items-center space-x-2">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-meeting-panel-dark text-white rounded-lg px-3 py-1.5 text-sm border border-secondary-700 focus:ring-2 focus:ring-wolt-blue focus:border-transparent"
          >
              {languageOptions.map((lang: LanguageOption) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <select
            value={videoQuality}
              onChange={(e) => handleVideoQualityChange(e.target.value as '360p' | '480p' | '720p' | '1080p')}
              className="bg-meeting-panel-dark text-white rounded-lg px-3 py-1.5 text-sm border border-secondary-700 focus:ring-2 focus:ring-wolt-blue focus:border-transparent"
          >
            <option value="360p">360p</option>
              <option value="480p">480p</option>
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 bg-primary-500 rounded-lg hover:bg-primary-600 transition-all duration-200"
            title="Share meeting link"
          >
            {isCopied ? (
              <>
                <Check className="w-5 h-5" />
                <span className="hidden md:inline ml-2">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                <span className="hidden md:inline ml-2">Share</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className={`flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 rounded-lg transition-all duration-200 ${
              showParticipants ? 'bg-primary-600' : 'bg-primary-500 hover:bg-primary-600'
            }`}
            title="Show participants"
          >
            <Users className="w-5 h-5" />
            <span className="hidden md:inline ml-2">{users.length + 1}</span>
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center justify-center w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 rounded-lg transition-all duration-200 ${
              showChat ? 'bg-primary-600' : 'bg-primary-500 hover:bg-primary-600'
            }`}
            title="Toggle chat"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="hidden md:inline ml-2">Chat</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="fixed inset-0 pt-16 pb-20">
        <div className={`grid ${showChat ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'} h-full`}>
          <div className={`${showChat ? 'col-span-1 lg:col-span-3' : 'col-span-1'} h-full p-2 md:p-4 overflow-hidden`}>
            <div className={`grid ${getGridClass()} gap-2 md:gap-4 h-full max-h-full`}>
              {isScreenSharing && screenTrack && (
                <div className="col-span-full row-span-2 h-full max-h-full">
                  <VideoPlayer
                    user={{ uid: 'screen' as any, videoTrack: screenTrack, audioTrack: null }}
                    isLocal={true}
                  />
                </div>
              )}
              {start && tracks && !isScreenSharing && (
                <div className={`h-full max-h-full relative ${localActiveSpeaker ? 'ring-1 ring-white/20 rounded-lg' : ''}`}>
                  <VideoPlayer
                    user={{ 
                      uid: client.current?.uid || 0, 
                      videoTrack: tracks[1], 
                      audioTrack: tracks[0],
                      name: user?.name || 'You'
                    }}
                    isLocal={true}
                    isMuted={isMuted}
                    isVideoOff={isVideoOff}
                  />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-primary-500/20 rounded-md text-white text-sm flex items-center">
                    {user?.name || 'You'} {isCreator && <Crown className="w-3 h-3 ml-1 text-yellow-400" />} {localActiveSpeaker && !isMuted && <span className="ml-1 animate-pulse opacity-40 text-white/50">•</span>}
                  </div>
                </div>
              )}
              {users.map((user) => (
                <div 
                  key={user.uid} 
                  className={`h-full max-h-full relative ${user.isActiveSpeaker ? 'ring-1 ring-white/20 rounded-lg' : ''}`}
                >
                  <VideoPlayer user={user} />
                  <div className="absolute top-2 left-2 px-2 py-1 bg-primary-500/20 rounded-md text-white text-sm flex items-center">
                    {user.name || `User ${user.uid}`} {user.isCreator && <Crown className="w-3 h-3 ml-1 text-yellow-400" />} {user.isActiveSpeaker && <span className="ml-1 animate-pulse opacity-40 text-white/50">•</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {showChat && (
            <div className="h-full pr-2 md:pr-4 pt-2 md:pt-4 pb-2 md:pb-4 overflow-hidden">
              <div className="h-full bg-meeting-panel-dark rounded-lg shadow-lg">
                <TranscriptPanel selectedLanguage={selectedLanguage} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-meeting-surface-dark/95 backdrop-blur-sm p-4 border-t border-secondary-700 shadow-lg">
        <div className="flex justify-center space-x-3 md:space-x-4">
          <button
            onClick={async () => {
              if (tracks?.[1]) {
                const newState = !isVideoOff;
                
                try {
                  // First update the track state
                  await tracks[1].setEnabled(!newState);
                  
                  // If turning video off, unpublish it to save bandwidth
                  // If turning video on, ensure it's published
                  if (client.current) {
                    if (newState) {
                      // Video is being turned off
                      console.log("Video turned off");
                      // No need to unpublish, just disable
                    } else {
                      // Video is being turned on
                      console.log("Video turned on");
                      // Ensure the track is published
                      if (!client.current.remoteUsers.some(user => 
                        user.hasVideo && tracks[1].getTrackId() === user.videoTrack?.getTrackId())) {
                        try {
                          // Check if already published
                          const localTracks = client.current.localTracks;
                          const isVideoPublished = localTracks.some(track => 
                            track.trackMediaType === 'video' && track.getTrackId() === tracks[1].getTrackId());
                            
                          if (!isVideoPublished) {
                            await client.current.publish([tracks[1]]);
                            console.log("Re-published video track");
                          }
                        } catch (error) {
                          console.error("Error re-publishing video:", error);
                        }
                      }
                    }
                  }
                  
                  // Update state after successful operation
                  setIsVideoOff(newState);
                } catch (error) {
                  console.error("Error toggling video:", error);
                }
              }
            }}
            className={`p-3 md:p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              isVideoOff ? 'bg-danger-500 hover:bg-danger-600' : 'bg-meeting-control-dark/50 hover:bg-meeting-control-dark text-secondary-300'
            } text-white relative group`}
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5 md:w-6 md:h-6" /> : <Video className="w-5 h-5 md:w-6 md:h-6" />}
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-meeting-surface-dark px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              {isVideoOff ? "Turn on camera" : "Turn off camera"}
            </span>
          </button>
          <button
            onClick={async () => {
              if (tracks?.[0]) {
                const newState = !isMuted;
                
                try {
                  // First update the track state
                  await tracks[0].setEnabled(!newState);
                  
                  // If turning audio off, consider muting at the source
                  // If turning audio on, ensure it's published
                  if (client.current) {
                    if (newState) {
                      // Audio is being muted
                      console.log("Audio muted");
                      // No need to unpublish, just disable
                    } else {
                      // Audio is being unmuted
                      console.log("Audio unmuted");
                      // Ensure the track is published
                      if (!client.current.remoteUsers.some(user => 
                        user.hasAudio && tracks[0].getTrackId() === user.audioTrack?.getTrackId())) {
                        try {
                          // Check if already published
                          const localTracks = client.current.localTracks;
                          const isAudioPublished = localTracks.some(track => 
                            track.trackMediaType === 'audio' && track.getTrackId() === tracks[0].getTrackId());
                            
                          if (!isAudioPublished) {
                            await client.current.publish([tracks[0]]);
                            console.log("Re-published audio track");
                          }
                        } catch (error) {
                          console.error("Error re-publishing audio:", error);
                        }
                      }
                    }
                  }
                  
                  // Update state after successful operation
                  setIsMuted(newState);
                } catch (error) {
                  console.error("Error toggling audio:", error);
                }
              }
            }}
            className={`p-3 md:p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              isMuted ? 'bg-danger-500 hover:bg-danger-600' : 'bg-meeting-control-dark/50 hover:bg-meeting-control-dark text-secondary-300'
            } text-white relative group`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-meeting-surface-dark px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              {isMuted ? "Unmute" : "Mute"}
            </span>
          </button>
          <button
            onClick={toggleScreenShare}
            className={`p-3 md:p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${
              isScreenSharing ? 'bg-primary-500 hover:bg-primary-600' : 'bg-meeting-control-dark/50 hover:bg-meeting-control-dark text-secondary-300'
            } text-white relative group`}
            title={isScreenSharing ? "Stop sharing" : "Share screen"}
          >
            <Monitor className="w-5 h-5 md:w-6 md:h-6" />
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-meeting-surface-dark px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              {isScreenSharing ? "Stop sharing" : "Share screen"}
            </span>
          </button>
          <button
            onClick={() => navigate('/settings', { state: { from: location.pathname } })}
            className="p-3 md:p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 bg-primary-500 hover:bg-primary-600 text-white relative group"
            title="Settings"
          >
            <Settings className="w-5 h-5 md:w-6 md:h-6" />
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-meeting-surface-dark px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Settings
            </span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="p-3 md:p-4 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 bg-danger-500 hover:bg-danger-600 text-white relative group"
            title="Leave meeting"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-meeting-surface-dark px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Leave meeting
            </span>
          </button>
        </div>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="fixed right-0 top-0 h-full w-64 md:w-80 bg-meeting-surface-dark/95 backdrop-blur-sm text-white p-4 z-20 border-l border-secondary-700 shadow-lg transform transition-transform duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Participants ({users.length + 1})</h2>
            <button 
              onClick={() => setShowParticipants(false)}
              className="p-1.5 hover:bg-meeting-control-dark rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 scrollbar-thin">
            {start && tracks && (
              <div className="flex items-center justify-between p-3 bg-meeting-panel-dark hover:bg-meeting-panel-dark/70 rounded-lg transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full ${localActiveSpeaker ? 'bg-primary-500/80' : 'bg-primary-500'} flex items-center justify-center relative`}>
                    {user?.name?.charAt(0) || 'Y'}
                    {localActiveSpeaker && !isMuted && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-white/20 rounded-full animate-pulse"></span>
                    )}
                    {isCreator && (
                      <span className="absolute -top-1 -right-1">
                        <Crown className="w-3 h-3 text-yellow-400" />
                      </span>
                    )}
                  </div>
                  <span className="font-medium flex items-center">
                    {user?.name || 'You'} (You) {isCreator && <Crown className="w-3 h-3 ml-1 text-yellow-400" />}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {isMuted ? <MicOff className="w-4 h-4 text-danger-500" /> : <Mic className="w-4 h-4" />}
                  {isVideoOff ? <VideoOff className="w-4 h-4 text-danger-500" /> : <Video className="w-4 h-4" />}
                </div>
              </div>
            )}
            {users.map((user) => (
              <div key={user.uid} className="flex items-center justify-between p-3 bg-meeting-panel-dark hover:bg-meeting-panel-dark/70 rounded-lg transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full ${user.isActiveSpeaker ? 'bg-primary-500/80' : 'bg-primary-500/70'} flex items-center justify-center relative`}>
                    {(user.name || `User ${user.uid}`).charAt(0)}
                    {user.isActiveSpeaker && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-white/20 rounded-full animate-pulse"></span>
                    )}
                    {user.isCreator && (
                      <span className="absolute -top-1 -right-1">
                        <Crown className="w-3 h-3 text-yellow-400" />
                      </span>
                    )}
                  </div>
                  <span className="font-medium flex items-center">
                    {user.name || `User ${user.uid}`} {user.isCreator && <Crown className="w-3 h-3 ml-1 text-yellow-400" />}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {user.audioTrack ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-danger-500" />}
                  {user.videoTrack ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4 text-danger-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}