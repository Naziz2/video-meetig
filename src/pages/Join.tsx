import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, ArrowLeft, Loader2, Plus, Copy, Share2, Users, Info } from 'lucide-react';
import { useStore } from '../store/useStore';

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
  const { setCredentials } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomId(roomParam);
    }
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

    // Check if the room ID exists
    const roomIds = getRoomIds();
    if (!roomIds.includes(roomId)) {
      setError('Meeting code does not exist. Please check the code or create a new meeting.');
      return;
    }

    setIsLoading(true);
    try {
      const uniqueId = generateUniqueId();
      saveUser(uniqueId, name.trim());
      // Use the correct Agora App ID
      setCredentials('767291001f404b57a5ae8faa042478c6', roomId, null);
      useStore.getState().setUser({
        id: uniqueId,
        name: name.trim(),
        email: ''
      });
      navigate(`/room/${roomId}`);
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

    // Ensure we have a unique room ID
    if (!roomId || !isRoomIdUnique(roomId)) {
      const newRoomId = getUniqueRoomId();
      setRoomId(newRoomId);
    } else {
      // Save the current room ID if it's unique
      saveRoomId(roomId);
    }

    setIsLoading(true);
    try {
      const uniqueId = generateUniqueId();
      saveUser(uniqueId, name.trim());
      // Use the correct Agora App ID
      setCredentials('767291001f404b57a5ae8faa042478c6', roomId, null);
      useStore.getState().setUser({
        id: uniqueId,
        name: name.trim(),
        email: ''
      });
      navigate(`/room/${roomId}`);
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

  useEffect(() => {
    if (showCreateForm) {
      const newRoomId = getUniqueRoomId();
      setRoomId(newRoomId);
    } else {
      // Clear room ID when going back to join form unless there's one in the URL
      const params = new URLSearchParams(location.search);
      const roomParam = params.get('room');
      setRoomId(roomParam || '');
    }
  }, [showCreateForm, location.search]);

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-secondary-700">
          <button
            onClick={() => {
              if (showCreateForm) {
                setShowCreateForm(false);
              } else {
                navigate('/');
              }
            }}
            className="flex items-center text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {showCreateForm ? 'Back to Join' : 'Back to Home'}
          </button>

          <div className="flex items-center justify-center mb-8">
            <Video className="w-12 h-12 text-wolt-blue" />
          </div>

          {!showCreateForm ? (
            <>
              <h1 className="text-3xl font-bold text-center mb-2">
                <span className="bg-gradient-to-r from-wolt-blue via-wolt-teal to-wolt-blue bg-clip-text text-transparent">
                  Join Meeting
                </span>
              </h1>
              <p className="text-secondary-600 dark:text-secondary-400 text-center mb-8">Enter your name to join the meeting</p>
              
              {error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-wolt-blue"
                    placeholder="Enter your name"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="roomId" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Meeting Code
                  </label>
                  <input
                    type="text"
                    id="roomId"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-wolt-blue"
                    placeholder="Enter meeting code"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="flex flex-col space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading || !roomId}
                    className="w-full bg-wolt-blue hover:bg-blue-600 text-white py-3 rounded-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Join Meeting'
                    )}
                  </button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-secondary-200 dark:border-secondary-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400">or</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    disabled={isLoading}
                    className="w-full bg-white dark:bg-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-900 dark:text-white py-3 rounded-lg transition-all border border-secondary-200 dark:border-secondary-700 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5 text-wolt-teal" />
                    <span>Create New Meeting</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-center mb-2">
                <span className="bg-gradient-to-r from-wolt-blue via-wolt-teal to-wolt-blue bg-clip-text text-transparent">
                  Create Meeting
                </span>
              </h1>
              <p className="text-secondary-600 dark:text-secondary-400 text-center mb-8">Set up a new video meeting</p>
              
              {error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-6">
                <div>
                  <label htmlFor="createName" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="createName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-wolt-blue"
                    placeholder="Enter your name"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Meeting Code</span>
                    <span className="text-sm font-mono text-wolt-blue dark:text-wolt-teal">{roomId}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white dark:bg-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-900 dark:text-white rounded-lg transition-all border border-secondary-200 dark:border-secondary-700"
                    >
                      <Copy className="w-4 h-4 text-wolt-blue" />
                      <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white dark:bg-secondary-800 hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-900 dark:text-white rounded-lg transition-all border border-secondary-200 dark:border-secondary-700"
                    >
                      <Share2 className="w-4 h-4 text-wolt-teal" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-wolt-blue hover:bg-blue-600 text-white py-3 rounded-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Users className="w-5 h-5" />
                      <span>Start Meeting</span>
                    </>
                  )}
                </button>

                <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/10 rounded-lg border border-teal-100 dark:border-teal-800/20">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-wolt-teal flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm text-secondary-700 dark:text-secondary-300">Meeting Features:</p>
                      <ul className="text-xs text-secondary-600 dark:text-secondary-400 space-y-1">
                        <li>• HD video and crystal-clear audio</li>
                        <li>• Screen sharing and chat</li>
                        <li>• No time limits</li>
                        <li>• Up to 100 participants</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};