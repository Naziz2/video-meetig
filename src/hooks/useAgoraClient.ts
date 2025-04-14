import { useState, useEffect } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, ILocalVideoTrack } from 'agora-rtc-sdk-ng';

interface User {
  uid: string | number;
  videoTrack?: any;
  audioTrack?: any;
  name?: string;
}

interface UseAgoraClientProps {
  appId: string;
  channelId: string | undefined;
  userId: string | null;
  userName: string | null;
  videoQuality: '360p' | '480p' | '720p' | '1080p';
  audioInput: string;
  videoInput: string;
}

interface VideoConfig {
  width: number;
  height: number;
  frameRate: number;
  bitrate: number;
}

// Store user names globally to persist between component renders
const userNameMap: Record<string, string> = {};

export const useAgoraClient = ({
  appId,
  channelId,
  userId,
  userName,
  videoQuality,
  audioInput,
  videoInput
}: UseAgoraClientProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [start, setStart] = useState(false);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [tracks, setTracks] = useState<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null);
  const [screenTrack, setScreenTrack] = useState<ILocalVideoTrack | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Store the current user's name in the global map
  useEffect(() => {
    if (userId && userName) {
      userNameMap[userId] = userName;
    }
  }, [userId, userName]);

  useEffect(() => {
    let localTracks: [IMicrophoneAudioTrack, ICameraVideoTrack] | null = null;
    
    const client = AgoraRTC.createClient({ 
      mode: 'rtc', 
      codec: 'vp8',
      role: 'host'
    });
    setClient(client);

    const init = async (channelName: string) => {
      // Set up a custom message channel for user names
      // This could be implemented with localStorage for local testing
      // or with a proper backend in production
      const broadcastUserName = () => {
        if (userId && userName) {
          try {
            // Store in localStorage for demo purposes
            // In a real app, you would use RTM or a backend
            const existingNames = JSON.parse(localStorage.getItem('agoraUserNames') || '{}');
            existingNames[userId] = userName;
            localStorage.setItem('agoraUserNames', JSON.stringify(existingNames));
            
            // Also update our in-memory map
            userNameMap[userId] = userName;
            
            console.log('Broadcasted user name:', { userId, userName });
          } catch (e) {
            console.error('Error broadcasting user name:', e);
          }
        }
      };
      
      // Listen for user name updates
      const checkForUserNames = () => {
        try {
          const storedNames = JSON.parse(localStorage.getItem('agoraUserNames') || '{}');
          
          // Update our users with the names
          setUsers(prevUsers => {
            let updated = false;
            const newUsers = prevUsers.map(user => {
              const uid = user.uid.toString();
              if (storedNames[uid] && user.name !== storedNames[uid]) {
                updated = true;
                return { ...user, name: storedNames[uid] };
              }
              return user;
            });
            
            return updated ? newUsers : prevUsers;
          });
        } catch (e) {
          console.error('Error checking for user names:', e);
        }
      };

      client.on('user-published', async (user, mediaType) => {
        try {
          await client.subscribe(user, mediaType);
          
          // Get a user-friendly name
          const uid = user.uid.toString();
          const remoteName = userNameMap[uid] || `User ${uid}`;
          
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
              return [...prevUsers, {
                uid: user.uid,
                videoTrack: user.videoTrack,
                audioTrack: user.audioTrack,
                name: remoteName
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
              return [...prevUsers, {
                uid: user.uid,
                videoTrack: user.videoTrack,
                audioTrack: user.audioTrack,
                name: remoteName
              }];
            });
          }
          
          // Check for user names periodically
          checkForUserNames();
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
        // Join the channel
        await client.join(appId, channelName, null, userId || 'Anonymous');
        
        // Broadcast our user name after joining
        broadcastUserName();
        
        // Set up an interval to periodically broadcast our name and check for others
        const nameInterval = setInterval(() => {
          broadcastUserName();
          checkForUserNames();
        }, 5000);

        const videoConfigs: Record<string, VideoConfig> = {
          '360p': { 
            width: 640, 
            height: 360, 
            frameRate: 30, 
            bitrate: 600 
          },
          '480p': { 
            width: 854, 
            height: 480, 
            frameRate: 30, 
            bitrate: 1000 
          },
          '720p': { 
            width: 1280, 
            height: 720, 
            frameRate: 30, 
            bitrate: 2000 
          },
          '1080p': { 
            width: 1920, 
            height: 1080, 
            frameRate: 30, 
            bitrate: 4000 
          }
        };

        const videoConfig = videoConfigs[videoQuality] || videoConfigs['720p'];

        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack({
          microphoneId: audioInput !== 'default' ? audioInput : undefined,
          encoderConfig: {
            sampleRate: 48000,
            stereo: true,
            bitrate: 128
          }
        });

        const videoTrack = await AgoraRTC.createCameraVideoTrack({
          cameraId: videoInput !== 'default' ? videoInput : undefined,
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
        
        return () => {
          clearInterval(nameInterval);
        };
      } catch (error) {
        console.error('Error joining channel:', error);
      }
    };

    if (client && channelId) {
      init(channelId);
    }

    return () => {
      if (client) {
        client.leave();
        client.removeAllListeners();
        if (localTracks) {
          localTracks[0].close();
          localTracks[1].close();
        }
      }
    };
  }, [channelId, appId, userId, userName, audioInput, videoInput, videoQuality]);

  const toggleMute = () => {
    if (tracks && tracks[0]) {
      if (isMuted) {
        tracks[0].setEnabled(true);
      } else {
        tracks[0].setEnabled(false);
      }
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (tracks && tracks[1]) {
      if (isVideoOff) {
        tracks[1].setEnabled(true);
      } else {
        tracks[1].setEnabled(false);
      }
      setIsVideoOff(!isVideoOff);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenTrack) {
        await client?.unpublish(screenTrack);
        screenTrack.close();
        setScreenTrack(null);
      }
      setIsScreenSharing(false);
    } else {
      try {
        const track = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: {
            width: 1920,
            height: 1080,
            frameRate: 15,
            bitrateMin: 1000,
            bitrateMax: 2000
          }
        });
        
        // Handle the case where it returns an array of tracks
        const videoTrack = Array.isArray(track) ? track[0] : track;
        
        await client?.publish(videoTrack);
        setScreenTrack(videoTrack);
        setIsScreenSharing(true);
        
        // Handle when user stops screen sharing via browser UI
        videoTrack.on('track-ended', () => {
          client?.unpublish(videoTrack);
          videoTrack.close();
          setScreenTrack(null);
          setIsScreenSharing(false);
        });
      } catch (error) {
        console.error('Error sharing screen:', error);
        setIsScreenSharing(false);
      }
    }
  };

  return {
    users,
    start,
    client,
    tracks,
    screenTrack,
    isScreenSharing,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
    toggleScreenShare
  };
};
