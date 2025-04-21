import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MoreVertical, Trash2, Edit, Copy, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { Meeting } from '../types/meeting';
import { Link, useNavigate } from 'react-router-dom';

interface MeetingsListProps {
  limit?: number;
  showAll?: boolean;
  className?: string;
}

export const MeetingsList = ({ limit = 5, showAll = false, className = '' }: MeetingsListProps) => {
  const { user } = useStore();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMeetingMenu, setActiveMeetingMenu] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get meetings where user is host or a participant
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .or(`host_id.eq.${user.id},participants.cs.{${user.id}}`)
          .order('start_time', { ascending: true })
          .limit(showAll ? 50 : limit);
          
        if (error) throw error;
        
        // Filter out past meetings unless showAll is true
        const now = new Date().toISOString();
        const filteredMeetings = showAll 
          ? data 
          : data.filter((meeting: Meeting) => meeting.end_time >= now);
        
        setMeetings(filteredMeetings);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError('Failed to load meetings. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMeetings();
    
    // Set up a real-time subscription for meetings
    const meetingsSubscription = supabase
      .channel('meetings_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'meetings',
        filter: `host_id=eq.${user?.id}`
      }, () => {
        fetchMeetings();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(meetingsSubscription);
    };
  }, [user, limit, showAll]);
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const handleCopyLink = (meetingLink: string) => {
    navigator.clipboard.writeText(meetingLink);
    // Could show a toast notification here
    setActiveMeetingMenu(null);
  };
  
  const handleJoinMeeting = (roomId: string) => {
    navigate(`/join?room=${roomId}`);
  };
  
  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;
    
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);
        
      if (error) throw error;
      
      // Update the local state
      setMeetings(meetings.filter(meeting => meeting.id !== meetingId));
    } catch (err) {
      console.error('Error deleting meeting:', err);
      setError('Failed to delete meeting. Please try again.');
    }
    
    setActiveMeetingMenu(null);
  };
  
  const isMeetingActive = (meeting: Meeting) => {
    const now = new Date();
    const start = new Date(meeting.start_time);
    const end = new Date(meeting.end_time);
    
    return now >= start && now <= end;
  };
  
  if (isLoading) {
    return (
      <div className={`bg-theme-card rounded-2xl p-6 border border-theme ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Calendar className="mr-2 w-5 h-5 text-theme-button" />
            Your Meetings
          </h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-theme-button border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`bg-theme-card rounded-2xl p-6 border border-theme ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Calendar className="mr-2 w-5 h-5 text-theme-button" />
            Your Meetings
          </h2>
        </div>
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300 text-center">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-theme-card rounded-2xl p-6 border border-theme ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Calendar className="mr-2 w-5 h-5 text-theme-button" />
          Your Meetings
        </h2>
        
        {!showAll && meetings.length > 0 && (
          <Link 
            to="/profile?tab=meetings" 
            className="text-sm text-theme-button hover:text-theme-button-hover"
          >
            View All
          </Link>
        )}
      </div>
      
      {meetings.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No upcoming meetings scheduled</p>
          <Link 
            to="/profile?tab=meetings" 
            className="mt-3 inline-block text-theme-button hover:text-theme-button-hover"
          >
            Schedule a meeting
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map(meeting => (
            <div 
              key={meeting.id} 
              className="bg-secondary-800 rounded-xl p-4 hover:bg-secondary-700 transition-colors relative"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-white">{meeting.title}</h3>
                  <div className="mt-2 flex items-center text-gray-400 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{formatDateTime(meeting.start_time)}</span>
                  </div>
                  {meeting.recurring && (
                    <div className="mt-1 text-xs text-gray-500">
                      Recurring ({meeting.recurrence_pattern})
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {isMeetingActive(meeting) && (
                    <button 
                      onClick={() => handleJoinMeeting(meeting.room_id || '')}
                      className="bg-theme-button text-white px-3 py-1 rounded-lg text-sm flex items-center"
                    >
                      <Video className="w-4 h-4 mr-1" />
                      Join
                    </button>
                  )}
                  
                  <div className="relative">
                    <button
                      onClick={() => setActiveMeetingMenu(activeMeetingMenu === meeting.id ? null : meeting.id)}
                      className="p-1 rounded-full hover:bg-secondary-700 text-gray-400 hover:text-white"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {activeMeetingMenu === meeting.id && (
                      <div className="absolute right-0 mt-1 bg-secondary-800 border border-slate-700 rounded-lg shadow-lg z-10 w-40">
                        <div className="py-1">
                          <button
                            onClick={() => handleCopyLink(meeting.meeting_link || '')}
                            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-secondary-700 flex items-center"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </button>
                          
                          {user?.id === meeting.host_id && (
                            <>
                              <Link
                                to={`/profile?edit=${meeting.id}`}
                                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-secondary-700 flex items-center"
                                onClick={() => setActiveMeetingMenu(null)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                              
                              <button
                                onClick={() => handleDeleteMeeting(meeting.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-secondary-700 flex items-center"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {meeting.participants.length > 0 && (
                <div className="mt-3 flex items-center text-sm text-gray-400">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
