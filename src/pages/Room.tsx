import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { TopBar } from '../components/room/TopBar';
import { VideoGrid } from '../components/room/VideoGrid';
import { Controls } from '../components/room/Controls';
import { ParticipantsSidebar } from '../components/room/ParticipantsSidebar';
import { TranscriptPanel } from '../components/TranscriptPanel';
import { useAgoraClient } from '../hooks/useAgoraClient';
import { useRecording } from '../hooks/useRecording';
import { JoinRequestPopup } from '../components/JoinRequestPopup';
import { JoinRequest } from '../types/room';

export const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { appId, setCredentials, settings, user, joinRequests, updateJoinRequest } = useStore();
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('ar-TN');
  const [currentRequest, setCurrentRequest] = useState<JoinRequest | null>(null);
  const [roomExists, setRoomExists] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if room exists
  useEffect(() => {
    if (id) {
      // Check if the room ID exists in the valid rooms list
      const roomIds = localStorage.getItem('roomIds');
      const validRoomIds = roomIds ? JSON.parse(roomIds) : [];
      const exists = validRoomIds.includes(id);
      setRoomExists(exists);
      setIsLoading(false);

      // If room doesn't exist and we've finished checking, redirect to join page with error
      if (!exists && !isLoading && !user) {
        navigate('/join', { 
          state: { 
            error: `The meeting with code "${id}" does not exist.` 
          } 
        });
      }
      
      // If room exists but user is not authenticated, redirect to join page with room ID
      if (exists && !isLoading && !user) {
        navigate(`/join?room=${id}`);
      }
    }
  }, [id, user, isLoading, navigate]);

  // Initialize credentials
  useEffect(() => {
    if (id && roomExists) {
      setCredentials(appId, id, null);
    }
  }, [id, appId, setCredentials, roomExists]);

  // Check if current user is room creator
  const isRoomCreator = () => {
    const roomCreatorsData = localStorage.getItem('roomCreators');
    const roomCreators = roomCreatorsData ? JSON.parse(roomCreatorsData) : {};
    const isCreator = roomCreators[id || ''] === user?.id;
    console.log('Room creator check:', { 
      roomId: id, 
      userId: user?.id, 
      isCreator, 
      roomCreators 
    });
    return isCreator;
  };

  // Helper function to transfer admin role to another participant
  const transferAdminRole = (users: any[]) => {
    if (!id || !user?.id) return;
    
    const roomCreatorsData = localStorage.getItem('roomCreators');
    const roomCreators = roomCreatorsData ? JSON.parse(roomCreatorsData) : {};
    
    // Only proceed if the current user is the admin
    if (roomCreators[id] !== user.id) return;
    
    // Find the first available user to transfer admin rights to
    if (users.length > 0) {
      const newAdmin = users[0];
      console.log('Transferring admin role to:', newAdmin);
      
      // Update room creators in localStorage
      roomCreators[id] = newAdmin.uid.toString();
      localStorage.setItem('roomCreators', JSON.stringify(roomCreators));
      
      // Broadcast the admin change to all participants
      try {
        // Store admin info in localStorage for demo purposes
        const adminInfo = {
          roomId: id,
          adminId: newAdmin.uid.toString(),
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(`room_${id}_admin`, JSON.stringify(adminInfo));
        console.log('Admin role transferred successfully to:', newAdmin.uid);
      } catch (e) {
        console.error('Error broadcasting admin change:', e);
      }
    } else {
      console.log('No participants available to transfer admin role');
    }
  };

  // Get join requests from localStorage
  const getJoinRequestsFromLocalStorage = (): JoinRequest[] => {
    const requests = localStorage.getItem('joinRequests');
    return requests ? JSON.parse(requests) : [];
  };

  // Check for pending join requests on component mount
  useEffect(() => {
    if (isRoomCreator() && id) {
      console.log('Checking for pending join requests on room mount');
      const localStorageRequests = getJoinRequestsFromLocalStorage();
      console.log('Join requests from localStorage:', localStorageRequests);
      
      const pendingRequest = localStorageRequests.find(
        req => req.roomId === id && req.status === 'pending'
      );
      
      console.log('Pending request found on mount:', pendingRequest);
      
      if (pendingRequest && !currentRequest) {
        console.log('Setting current request from localStorage');
        setCurrentRequest(pendingRequest);
      }
    }
  }, [id, user?.id]);

  // Handle join requests
  useEffect(() => {
    console.log('Join requests updated:', { 
      joinRequests, 
      isCreator: isRoomCreator(), 
      userId: user?.id,
      roomId: id
    });
    
    if (isRoomCreator() && joinRequests.length > 0) {
      const pendingRequest = joinRequests.find(
        req => req.roomId === id && req.status === 'pending'
      );
      
      console.log('Pending request check:', { 
        pendingRequest, 
        roomId: id, 
        joinRequests 
      });
      
      if (pendingRequest && !currentRequest) {
        console.log('Setting current request:', pendingRequest);
        setCurrentRequest(pendingRequest);
      }
    }
  }, [joinRequests, id, currentRequest, user?.id]);

  // Poll for new join requests periodically
  useEffect(() => {
    if (isRoomCreator() && id) {
      console.log('Setting up polling for join requests');
      
      const checkForNewRequests = () => {
        const localStorageRequests = getJoinRequestsFromLocalStorage();
        const pendingRequest = localStorageRequests.find(
          req => req.roomId === id && req.status === 'pending' && !currentRequest
        );
        
        if (pendingRequest && !currentRequest) {
          console.log('New pending request found during polling:', pendingRequest);
          setCurrentRequest(pendingRequest);
        }
      };
      
      // Check every 5 seconds
      const interval = setInterval(checkForNewRequests, 5000);
      
      return () => clearInterval(interval);
    }
  }, [id, currentRequest, user?.id]);

  // Handle request approval
  const handleApproveRequest = (requestId: string) => {
    console.log('Approving request:', requestId);
    updateJoinRequest(requestId, 'approved');
    setCurrentRequest(null);
  };

  // Handle request rejection
  const handleRejectRequest = (requestId: string) => {
    console.log('Rejecting request:', requestId);
    updateJoinRequest(requestId, 'rejected');
    setCurrentRequest(null);
  };

  // Language options for translation
  const languageOptions = [
    { code: 'ar-TN', name: 'العربية التونسية' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'en-US', name: 'English' },
    { code: 'ar', name: 'العربية الفصحى' }
  ];

  // Generate share link
  const shareLink = `${window.location.origin}/join?room=${id}`;

  // Handle share link copy
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      alert('Meeting link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Use our custom hooks
  const {
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
  } = useAgoraClient({
    appId,
    channelId: id,
    userId: user?.id || null,
    userName: user?.name || null,
    videoQuality: settings.videoQuality as '360p' | '480p' | '720p' | '1080p',
    audioInput: settings.audioInput,
    videoInput: settings.videoInput
  });

  const {
    isRecording,
    recordingStatus,
    toggleRecording
  } = useRecording();

  // Navigation handlers
  const handleSettingsOpen = () => {
    navigate('/settings', { state: { from: location.pathname } });
  };

  const handleLeave = () => {
    // Transfer admin role before leaving if current user is admin
    if (isRoomCreator()) {
      transferAdminRole(users);
    }
    
    // Clean up and leave the room
    if (client) {
      client.leave().then(() => {
        console.log('Left channel successfully');
        // Stop any active recording
        if (isRecording) {
          toggleRecording();
        }
        // Navigate to home page
        navigate('/');
      }).catch(err => {
        console.error('Error leaving channel:', err);
        // Still navigate to home even if there's an error
        navigate('/');
      });
    } else {
      navigate('/');
    }
  };

  // Add cleanup effect when component unmounts
  useEffect(() => {
    // This will run when the component is unmounted or when the route changes
    return () => {
      // Cleanup any resources that might not be handled by the hooks
      console.log('Room component unmounting, cleaning up resources');
      
      // Transfer admin role before unmounting if current user is admin
      if (isRoomCreator()) {
        transferAdminRole(users);
      }
      
      // If there's an active recording, stop it
      if (isRecording) {
        toggleRecording();
      }
    };
  }, [isRecording, toggleRecording, users]);

  // Check for admin changes (for non-admin users)
  useEffect(() => {
    if (!isRoomCreator() && id) {
      const checkAdminChanges = () => {
        try {
          const adminInfoData = localStorage.getItem(`room_${id}_admin`);
          if (adminInfoData) {
            const adminInfo = JSON.parse(adminInfoData);
            // If the current user is the new admin, update the room creators
            if (adminInfo.adminId === user?.id) {
              const roomCreatorsData = localStorage.getItem('roomCreators');
              const roomCreators = roomCreatorsData ? JSON.parse(roomCreatorsData) : {};
              
              // Only update if not already set
              if (roomCreators[id] !== user?.id) {
                roomCreators[id] = user?.id;
                localStorage.setItem('roomCreators', JSON.stringify(roomCreators));
                console.log('Updated room creator status for current user');
                
                // Force a re-render to update UI
                // This is a hack, in a real app you'd use a state update
                setTimeout(() => {
                  window.dispatchEvent(new Event('storage'));
                }, 100);
              }
            }
          }
        } catch (e) {
          console.error('Error checking admin changes:', e);
        }
      };
      
      // Check immediately and then set interval
      checkAdminChanges();
      const interval = setInterval(checkAdminChanges, 5000);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [id, user?.id]);

  // Log component mount
  useEffect(() => {
    console.log('Room component mounted:', {
      roomId: id,
      userId: user?.id,
      isCreator: isRoomCreator(),
      joinRequests
    });
  }, []);

  // Show loading state while checking if room exists
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Checking meeting...</p>
        </div>
      </div>
    );
  }

  // If room doesn't exist, show error message (this will be briefly shown before redirect)
  if (!roomExists) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center p-8 bg-slate-800 rounded-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-white text-2xl font-bold mb-4">Meeting Not Found</h1>
          <p className="text-slate-300 mb-6">The meeting with code "{id}" does not exist.</p>
          <button 
            onClick={() => navigate('/join')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            Go to Join Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Join Request Popup */}
      {currentRequest && (
        <JoinRequestPopup
          request={currentRequest}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
        />
      )}

      {/* Top Bar */}
      <TopBar
        roomId={id}
        selectedLanguage={selectedLanguage}
        languageOptions={languageOptions}
        participantsCount={users.length + 1}
        onLanguageChange={setSelectedLanguage}
        onShareClick={handleShare}
        onParticipantsToggle={() => setShowParticipants(!showParticipants)}
        onChatToggle={() => setShowChat(!showChat)}
      />

      {/* Main Content */}
      <div className="fixed inset-0 pt-16 pb-20">
        <div className={`grid ${showChat ? 'grid-cols-4' : 'grid-cols-1'} h-full`}>
          <div className={`${showChat ? 'col-span-3' : 'col-span-1'} h-full p-4 overflow-hidden`}>
            <VideoGrid
              users={users}
              client={client}
              start={start}
              tracks={tracks}
              screenTrack={screenTrack}
              isScreenSharing={isScreenSharing}
              isMuted={isMuted}
              isVideoOff={isVideoOff}
              userName={user?.name || 'You'}
            />
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
      <Controls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isRecording={isRecording}
        onMuteToggle={toggleMute}
        onVideoToggle={toggleVideo}
        onScreenShareToggle={toggleScreenShare}
        onRecordToggle={toggleRecording}
        onLeave={handleLeave}
        onSettingsOpen={handleSettingsOpen}
        recordingStatus={recordingStatus}
      />

      {/* Participants Sidebar */}
      <ParticipantsSidebar
        isVisible={showParticipants}
        users={users}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        tracks={tracks}
        onClose={() => setShowParticipants(false)}
      />

      {/* Hidden container for storing uploaded recordings */}
      <div id="gridContainer" className="hidden"></div>
    </div>
  );
};