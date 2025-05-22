import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, ArrowLeft, Loader2, Plus, Copy, Share2, Users, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { WaitingRoom } from '../components/WaitingRoom';
import { JoinRequest } from '../types/room';
import { supabase } from '../lib/supabase';

// Helper function to generate a unique ID for users
const generateUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomStr}`;
};

// Helper function to generate a room ID
const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 9);
};

// Helper functions to manage room IDs
const getRoomIds = (): string[] => {
  const roomIds = localStorage.getItem('roomIds');
  return roomIds ? JSON.parse(roomIds) : [];
};

const saveRoomId = (roomId: string): void => {
  const roomIds = getRoomIds();
  if (!roomIds.includes(roomId)) {
    roomIds.push(roomId);
    localStorage.setItem('roomIds', JSON.stringify(roomIds));
  }
};

const isRoomIdUnique = (roomId: string): boolean => {
  const roomIds = getRoomIds();
  return !roomIds.includes(roomId);
};

const getUniqueRoomId = (): string => {
  let roomId = generateRoomId();
  while (!isRoomIdUnique(roomId)) {
    roomId = generateRoomId();
  }
  saveRoomId(roomId);
  return roomId;
};

// Helper functions to manage users
const saveUser = (userId: string, userName: string): void => {
  const usersData = localStorage.getItem('meetingUsers');
  const users = usersData ? JSON.parse(usersData) : {};
  users[userId] = userName;
  localStorage.setItem('meetingUsers', JSON.stringify(users));
};

// Export getUserName so it can be used in other components
export const getUserName = (userId: string): string => {
  const usersData = localStorage.getItem('meetingUsers');
  const users = usersData ? JSON.parse(usersData) : {};
  return users[userId] || userId;
};

export const Join = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCredentials, setUser, addJoinRequest, setPendingApproval } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [userId, setUserId] = useState('');
  const [waitingForApproval, setWaitingForApproval] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomId(roomParam);
    }
    
    // Check for error message from invalid room attempt
    if (location.state && location.state.error) {
      setError(location.state.error);
    }

    // Debug: Log room creators on component mount
    const roomCreatorsData = localStorage.getItem('roomCreators');
    const roomCreators = roomCreatorsData ? JSON.parse(roomCreatorsData) : {};
    console.log('Join component mounted, room creators:', roomCreators);
  }, [location]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomId) {
      setError('Invalid meeting code');
      return;
    }


    setIsLoading(true);
    try {
      const uniqueId = generateUniqueId();
      saveUser(uniqueId, name.trim());
      setUserId(uniqueId);
      
      // Check if this is the room creator
      const roomCreatorsData = localStorage.getItem('roomCreators');
      const roomCreators = roomCreatorsData ? JSON.parse(roomCreatorsData) : {};
      const isCreator = roomCreators[roomId] === uniqueId;
      
      console.log('Join attempt:', { 
        roomId, 
        userId: uniqueId, 
        userName: name.trim(), 
        isCreator,
        roomCreators
      });
      
      // Save Agora App ID to localStorage for later use
      const appId = import.meta.env.VITE_AGORA_APP_ID;
      localStorage.setItem('appId', appId);
      
      // If this is the room creator, allow direct access
      if (isCreator) {
        console.log('User is room creator, allowing direct access');
        // Use the Agora App ID from environment variables
        setCredentials(appId, roomId, null);
        setUser({
          id: uniqueId,
          name: name.trim(),
          email: ''
        });
        
        // Save user name to localStorage
        localStorage.setItem(`user_${uniqueId}`, name.trim());
        
        navigate(`/room/${roomId}`);
      } else {
        // If not the creator, send a join request
        console.log('User is not room creator, creating join request');
        const joinRequest: JoinRequest = {
          id: uniqueId,
          userName: name.trim(),
          roomId,
          timestamp: Date.now(),
          status: 'approved'
        };
        
        console.log('Creating join request:', joinRequest);
        addJoinRequest(joinRequest);
        setPendingApproval(true);
        setWaitingForApproval(true);
        
        // Set user info in store for later use if approved
        setUser({
          id: uniqueId,
          name: name.trim(),
          email: ''
        });
        
        // Save user name to localStorage
        localStorage.setItem(`user_${uniqueId}`, name.trim());
        
        // Debug: Check if join request was added to store
        setTimeout(() => {
          const state = useStore.getState();
          console.log('Store state after adding join request:', {
            joinRequests: state.joinRequests,
            pendingApproval: state.pendingApproval
          });
        }, 500);
      }
    } catch (err) {
      console.error('Join error:', err);
      setError('Failed to join the meeting. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    // Always generate a new unique room ID if not provided
    let finalRoomId = roomId;
    if (!finalRoomId) {
      finalRoomId = getUniqueRoomId();
      setRoomId(finalRoomId);
    }

    setIsLoading(true);
    try {
      const uniqueId = generateUniqueId();
      saveUser(uniqueId, name.trim());
      

      // Save Agora App ID to localStorage for later use
      const appId = import.meta.env.VITE_AGORA_APP_ID;
      localStorage.setItem('appId', appId);
      
      // Use the Agora App ID from environment variables
      setCredentials(appId, finalRoomId, null);
      setUser({
        id: uniqueId,
        name: name.trim(),
        email: ''
      });
      
      // Save user name to localStorage
      localStorage.setItem(`user_${uniqueId}`, name.trim());
      
      // Mark this user as the creator of the room (local only, for legacy logic)
      const roomCreatorsData = localStorage.getItem('roomCreators');
      const roomCreators = roomCreatorsData ? JSON.parse(roomCreatorsData) : {};
      roomCreators[finalRoomId] = uniqueId;
      localStorage.setItem('roomCreators', JSON.stringify(roomCreators));
      
      console.log('Room created:', { 
        roomId: finalRoomId, 
        userId: uniqueId, 
        userName: name.trim(),
        roomCreators
      });
      
      navigate(`/room/${finalRoomId}`);
    } catch (err) {
      console.error('Create error:', err);
      setError('Failed to create the meeting. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const meetingLink = `${window.location.origin}/join?room=${roomId}`;
    try {
      await navigator.clipboard.writeText(meetingLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    const meetingLink = `${window.location.origin}/join?room=${roomId}`;
    try {
      await navigator.share({
        title: 'Join my MeetFlow meeting',
        text: 'Click the link to join my video meeting:',
        url: meetingLink
      });
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  // If waiting for approval, show waiting room
  if (waitingForApproval) {
    return <WaitingRoom roomId={roomId} userName={name} userId={userId} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center">
        <button 
          onClick={() => navigate('/')} 
          className="mr-4 p-2 rounded-full hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-300" />
        </button>
        <div className="flex items-center">
          <Video className="h-6 w-6 text-blue-500 mr-2" />
          <h1 className="text-xl font-semibold text-white">MeetFlow</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Join or Create Toggle */}
          <div className="bg-slate-800 p-1 rounded-lg flex mb-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className={`flex-1 py-2 rounded-md text-center transition-colors ${
                !showCreateForm ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              Join a Meeting
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className={`flex-1 py-2 rounded-md text-center transition-colors ${
                showCreateForm ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              Create a Meeting
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm flex items-start">
                <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </p>
            </div>
          )}

          {/* Join Form */}
          {!showCreateForm ? (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-slate-300 mb-1">
                  Meeting Code
                </label>
                <input
                  type="text"
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter meeting code"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Users className="h-5 w-5 mr-2" />
                    Join Meeting
                  </>
                )}
              </button>
            </form>
          ) : (
            // Create Form
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="create-name" className="block text-sm font-medium text-slate-300 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="create-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="create-roomId" className="block text-sm font-medium text-slate-300 mb-1">
                  Meeting Code (Optional)
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="create-roomId"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Auto-generate if empty"
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-slate-400"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setRoomId(getUniqueRoomId())}
                    className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-r-lg hover:bg-slate-500 transition-colors"
                    disabled={isLoading}
                  >
                    <Plus className="h-5 w-5 text-slate-200" />
                  </button>
                </div>
              </div>
              {roomId && (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors flex items-center justify-center"
                    disabled={isLoading}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex-1 py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors flex items-center justify-center"
                    disabled={isLoading}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </button>
                </div>
              )}
              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Video className="h-5 w-5 mr-2" />
                    Create Meeting
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};