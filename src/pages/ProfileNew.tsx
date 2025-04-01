import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { LucideVideo, Settings, Video, Plus, Copy, Calendar, Clock, LogOut } from 'lucide-react';
import { initDefaultData } from '../lib/defaultData';

interface MeetingHistory {
  id: string;
  roomId: string;
  created_at: string;
  title?: string;
}

export const ProfileNew = () => {
  const { user, setUser } = useStore();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<MeetingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Make sure default data is initialized
    initDefaultData();
    
    // Check if user is logged in
    if (!user) {
      console.log('No user found in store, redirecting to login');
      navigate('/login');
      return;
    } else {
      console.log('User found in store:', user.name);
    }

    // Fetch user's meeting history
    const fetchMeetings = async () => {
      try {
        setIsLoading(true);
        // Get meetings from localStorage
        const roomIds = localStorage.getItem('roomIds');
        console.log('Room IDs from localStorage:', roomIds);
        const parsedRoomIds = roomIds ? JSON.parse(roomIds) : [];
        
        // Format meeting history
        const formattedMeetings = parsedRoomIds.map((roomId: string, index: number) => {
          const date = new Date();
          // Stagger meeting dates so they appear to be created over time
          date.setDate(date.getDate() - index);
          
          return {
            id: Math.random().toString(36).substring(2, 11),
            roomId,
            created_at: date.toISOString(),
            title: `Meeting ${roomId.substring(0, 6)}`
          };
        });
        
        console.log('Formatted meetings:', formattedMeetings);
        setMeetings(formattedMeetings);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError('Failed to load meeting history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetings();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      
      // For test user, just clear the store
      if (user?.id === 'test-user-id') {
        setUser(null);
        navigate('/login');
        return;
      }
      
      // For regular users, use Supabase
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const createNewMeeting = () => {
    const meetingId = Math.random().toString(36).substring(2, 11);
    console.log('Creating new meeting:', meetingId);
    
    // Save to localStorage
    const roomIds = localStorage.getItem('roomIds');
    const existingRoomIds = roomIds ? JSON.parse(roomIds) : [];
    if (!existingRoomIds.includes(meetingId)) {
      existingRoomIds.push(meetingId);
      localStorage.setItem('roomIds', JSON.stringify(existingRoomIds));
    }
    
    // Mark this user as the creator of the room
    const roomCreatorsData = localStorage.getItem('roomCreators');
    const roomCreators = roomCreatorsData ? JSON.parse(roomCreatorsData) : {};
    roomCreators[meetingId] = user?.id;
    localStorage.setItem('roomCreators', JSON.stringify(roomCreators));
    
    // Navigate to the new meeting
    navigate(`/room/${meetingId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Handle the case where user is null
  if (!user) {
    return (
      <div className="min-h-screen bg-meeting-surface-dark flex items-center justify-center">
        <div className="bg-meeting-panel-dark p-8 rounded-lg shadow-lg text-center max-w-md">
          <LucideVideo className="h-12 w-12 text-primary-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Session Expired</h2>
          <p className="text-secondary-300 mb-6">Your session has expired or you're not signed in.</p>
          <Link 
            to="/login"
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-meeting-surface-dark">
      {/* Header */}
      <header className="bg-meeting-panel-dark border-b border-secondary-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <LucideVideo className="text-primary-500 h-6 w-6" />
            <span className="text-xl font-semibold text-white">VideoMeet</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/settings')}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <Settings className="h-5 w-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="text-white font-medium hidden sm:inline-block">
                {user?.name}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">Welcome, {user?.name}</h1>
          
          <div className="bg-meeting-panel-dark rounded-lg p-6 shadow-md border border-secondary-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Your Meetings</h2>
              <button
                onClick={createNewMeeting}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Meeting</span>
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-danger-300">{error}</p>
              </div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-secondary-700 rounded-lg">
                <Video className="h-12 w-12 text-secondary-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No meetings yet</h3>
                <p className="text-secondary-400 mb-6">Create your first meeting to get started</p>
                <button
                  onClick={createNewMeeting}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Create Meeting
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-secondary-800">
                <table className="min-w-full divide-y divide-secondary-800">
                  <thead className="bg-meeting-control-dark">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Meeting
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider hidden md:table-cell">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary-300 uppercase tracking-wider hidden sm:table-cell">
                        Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary-300 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-meeting-panel-dark divide-y divide-secondary-800">
                    {meetings.map((meeting) => (
                      <tr key={meeting.id} className="hover:bg-meeting-control-dark/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{meeting.title}</div>
                          <div className="text-xs text-secondary-400">ID: {meeting.roomId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-secondary-400 mr-2" />
                            <span className="text-sm text-secondary-300">{formatDate(meeting.created_at)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-secondary-400 mr-2" />
                            <span className="text-sm text-secondary-300">{formatTime(meeting.created_at)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/room/${meeting.roomId}`);
                                // Show toast or notification
                              }}
                              className="p-1.5 text-secondary-300 hover:text-white hover:bg-meeting-control-dark rounded"
                              title="Copy meeting link"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <Link
                              to={`/room/${meeting.roomId}`}
                              className="p-1.5 text-primary-400 hover:text-primary-300 hover:bg-meeting-control-dark rounded"
                              title="Join meeting"
                            >
                              <Video className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}; 