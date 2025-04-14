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

export const useAgoraClient = ({
  appId,
  channelId,
  userId,
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
                    ? { ...u, videoTrack: user.videoTrack, audioTrack: user.audioTrack }
                    : u
                );
              }
              return [...prevUsers, {
                uid: user.uid,
                videoTrack: user.videoTrack,
                audioTrack: user.audioTrack,
                name: user.uid
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
                name: user.uid
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
        await client.join(appId, channelName, null, userId || 'Anonymous');

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
        if (screenTrack) {
          screenTrack.close();
        }
      }
    };
  }, [appId, channelId, userId, videoQuality, audioInput, videoInput]);

  const toggleMute = async () => {
    if (!tracks) return;
    
    const newState = !isMuted;
    await tracks[0].setEnabled(!newState);
    setIsMuted(newState);
  };

  const toggleVideo = async () => {
    if (!tracks) return;
    
    const newState = !isVideoOff;
    await tracks[1].setEnabled(!newState);
    setIsVideoOff(newState);
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
