import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC, { 
  IAgoraRTCClient, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack
} from 'agora-rtc-sdk-ng';
import { useNavigate } from 'react-router-dom';

interface MeetingProps {
  credentials: {
    appId: string;
    channelName: string;
    uid: string;
    token: string;
  };
}

const Meeting: React.FC<MeetingProps> = ({ credentials }) => {
  const navigate = useNavigate();
  const client = useRef<IAgoraRTCClient | null>(null);
  const localTracks = useRef<(ICameraVideoTrack | IMicrophoneAudioTrack)[]>([]);
  const transcriptionInterval = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [isTranscriptionEnabled, setIsTranscriptionEnabled] = useState(false);

  const handleUserPublished = async (user: any, mediaType: "audio" | "video") => {
    await client.current?.subscribe(user, mediaType);
    setRemoteUsers(prev => [...prev, user]);
  };

  const handleUserUnpublished = (user: any) => {
    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
  };

  const handleUserLeft = (user: any) => {
    setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
  };

  const startTranscription = () => {
    // Transcription logic here
    transcriptionInterval.current = setInterval(() => {
      // Your transcription code
    }, 1000);
  };

  useEffect(() => {
    const initializeAgora = async () => {
      try {
        // Initialize Agora client
        client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await client.current.join(
          credentials.appId,
          credentials.channelName,
          credentials.uid,
          credentials.token
        );

        // Create and publish local tracks
        const [audioTrack, videoTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack(),
          AgoraRTC.createCameraVideoTrack()
        ]);

        localTracks.current = [audioTrack, videoTrack];
        await client.current.publish(localTracks.current);

        // Set up event listeners
        client.current.on("user-published", handleUserPublished);
        client.current.on("user-unpublished", handleUserUnpublished);
        client.current.on("user-left", handleUserLeft);

        // Set up transcription
        if (isTranscriptionEnabled) {
          startTranscription();
        }

        setLoading(false);
      } catch (error) {
        console.error("Error initializing Agora:", error);
        setError("Failed to join meeting. Please try again.");
        setLoading(false);
      }
    };

    initializeAgora();

    // Cleanup function
    return () => {
      const cleanup = async () => {
        try {
          // Stop all local tracks
          if (localTracks.current) {
            localTracks.current.forEach(track => {
              track.stop();
            });
            localTracks.current = [];
          }

          // Stop transcription if active
          if (transcriptionInterval.current) {
            clearInterval(transcriptionInterval.current);
            transcriptionInterval.current = null;
          }

          // Leave the channel
          if (client.current) {
            await client.current.leave();
            client.current = null;
          }

          // Clear remote users
          setRemoteUsers([]);
        } catch (error) {
          console.error("Error during cleanup:", error);
        }
      };

      cleanup();
    };
  }, [credentials, isTranscriptionEnabled]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {/* Your meeting UI components */}
    </div>
  );
};

export default Meeting; 