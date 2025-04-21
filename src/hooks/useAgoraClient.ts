import { useState, useEffect } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, ILocalVideoTrack } from 'agora-rtc-sdk-ng';

interface User {
  uid: string | number;
  videoTrack?: any;
  audioTrack?: any;
  name?: string;
  isScreenShare?: boolean; // Flag to indicate if this is a screen share
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

      // Helper function to detect if a track is a screen share
      const isScreenShareTrack = (track: any): boolean => {
        if (!track) return false;
        
        try {
          // Check multiple properties to determine if this is a screen share
          const trackId = track.getTrackId ? track.getTrackId() : '';
          const mediaStreamTrack = track.getMediaStreamTrack ? track.getMediaStreamTrack() : null;
          const trackLabel = mediaStreamTrack ? mediaStreamTrack.label : '';
          
          // Log for debugging
          console.log('Checking track for screen share:', {
            trackId,
            trackLabel,
            hasTrack: !!track
          });
          
          return (
            trackId.toLowerCase().includes('screen') ||
            trackLabel.toLowerCase().includes('screen') ||
            (track._hints && track._hints.type && track._hints.type.toLowerCase().includes('screen'))
          );
        } catch (err) {
          console.error('Error checking if track is screen share:', err);
          return false;
        }
      };

      client.on('user-published', async (user, mediaType) => {
        try {
          await client.subscribe(user, mediaType);
          
          // Get a user-friendly name
          const uid = user.uid.toString();
          const remoteName = userNameMap[uid] || `User ${uid}`;
          
          if (mediaType === 'video') {
            // Check if this is a screen share
            const isScreenShare = isScreenShareTrack(user.videoTrack);
            
            console.log('Remote user published video:', {
              uid: user.uid,
              name: remoteName,
              isScreenShare
            });
            
            setUsers(prevUsers => {
              const existingUser = prevUsers.find(u => u.uid === user.uid);
              if (existingUser) {
                return prevUsers.map(u => 
                  u.uid === user.uid 
                    ? { 
                        ...u, 
                        videoTrack: user.videoTrack, 
                        name: remoteName,
                        isScreenShare
                      } 
                    : u
                );
              } else {
                return [...prevUsers, { 
                  uid: user.uid, 
                  videoTrack: user.videoTrack, 
                  name: remoteName,
                  isScreenShare
                }];
              }
            });
          }
          
          if (mediaType === 'audio') {
            setUsers(prevUsers => {
              const existingUser = prevUsers.find(u => u.uid === user.uid);
              if (existingUser) {
                return prevUsers.map(u => 
                  u.uid === user.uid 
                    ? { ...u, audioTrack: user.audioTrack, name: remoteName } 
                    : u
                );
              } else {
                return [...prevUsers, { 
                  uid: user.uid, 
                  audioTrack: user.audioTrack, 
                  name: remoteName 
                }];
              }
            });
          }
        } catch (error) {
          console.error('Error subscribing to user:', error);
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'video') {
          setUsers(prevUsers => 
            prevUsers.map(u => 
              u.uid === user.uid 
                ? { ...u, videoTrack: undefined, isScreenShare: false } 
                : u
            )
          );
        }
        
        if (mediaType === 'audio') {
          setUsers(prevUsers => 
            prevUsers.map(u => 
              u.uid === user.uid 
                ? { ...u, audioTrack: undefined } 
                : u
            )
          );
        }
      });

      client.on('user-left', (user) => {
        console.log('User left:', user.uid);
        setUsers(prevUsers => prevUsers.filter(u => u.uid !== user.uid));
      });

      try {
        const uid = userId || Math.floor(Math.random() * 100000).toString();
        
        // Join the channel
        await client.join(appId, channelName, null, uid);
        console.log('Joined channel successfully:', { 
          appId, 
          channelName, 
          uid 
        });
        
        // Broadcast our name immediately
        broadcastUserName();
        
        // Set up periodic name broadcasting and checking
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
    if (!client) {
      console.error('Agora client not initialized');
      return;
    }

    // Debug current state
    console.log('Screen sharing toggle - Current state:', {
      isScreenSharing,
      hasScreenTrack: !!screenTrack,
      clientInitialized: !!client
    });

    if (isScreenSharing) {
      try {
        console.log('Stopping screen sharing...');
        // Stop screen sharing
        if (screenTrack) {
          console.log('Screen track exists, unpublishing...');
          // First unpublish the track
          await client.unpublish(screenTrack);
          console.log('Screen track unpublished successfully');
          
          // Then close it to release resources
          screenTrack.close();
          console.log('Screen track closed');
          setScreenTrack(null);
        } else {
          console.warn('Screen track not found but isScreenSharing is true');
        }
        setIsScreenSharing(false);
        console.log('Screen sharing stopped successfully');
        
        // Republish camera if it was unpublished
        if (tracks && tracks[1]) {
          try {
            await client.publish(tracks[1]);
            console.log('Camera republished after screen share');
          } catch (err) {
            console.error('Error republishing camera:', err);
          }
        }
      } catch (error) {
        console.error('Error stopping screen share:', error);
        // Still set state to not sharing to avoid UI inconsistency
        setIsScreenSharing(false);
      }
    } else {
      try {
        console.log('Starting screen sharing...');
        
        // Create screen video track with optimized settings
        console.log('Creating screen video track...');
        const screenVideoTrack = await AgoraRTC.createScreenVideoTrack(
          {
            encoderConfig: 'fullHD_1',
            optimizationMode: 'detail'
          },
          "disable"
        );
        
        console.log('Screen video track created:', screenVideoTrack);
        
        // Handle the case where it returns an array of tracks
        const videoTrack = Array.isArray(screenVideoTrack) 
          ? screenVideoTrack[0] 
          : screenVideoTrack;
        
        // Add screen share flag to the track
        if (videoTrack && typeof videoTrack === 'object') {
          (videoTrack as any)._isScreenShare = true;
        }
        
        console.log('Screen track created successfully, publishing...', videoTrack);
        
        // Unpublish camera first to save bandwidth
        if (tracks && tracks[1]) {
          await client.unpublish(tracks[1]);
          console.log('Camera unpublished before screen share');
        }
        
        // Publish the track to the channel
        await client.publish(videoTrack);
        console.log('Screen track published successfully');
        
        // Update state
        setScreenTrack(videoTrack);
        setIsScreenSharing(true);
        
        // Handle when user stops screen sharing via browser UI
        videoTrack.on('track-ended', async () => {
          console.log('Screen sharing ended by browser UI');
          try {
            await client.unpublish(videoTrack);
            videoTrack.close();
            
            // Republish camera
            if (tracks && tracks[1]) {
              await client.publish(tracks[1]);
              console.log('Camera republished after screen share ended');
            }
            
            setScreenTrack(null);
            setIsScreenSharing(false);
          } catch (err) {
            console.error('Error handling track-ended event:', err);
            setIsScreenSharing(false);
          }
        });
      } catch (err) {
        console.error('Error starting screen share:', err);
        // Check for permission denied error
        const errorString = String(err);
        if (errorString.includes('Permission denied') || 
            errorString.includes('NotAllowedError')) {
          console.log('User denied screen sharing permission');
        }
        setIsScreenSharing(false);
      }
    }
  };

  // Debug current state
  useEffect(() => {
    console.log('Screen sharing state updated:', {
      isScreenSharing,
      hasScreenTrack: !!screenTrack
    });
  }, [isScreenSharing, screenTrack]);

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
