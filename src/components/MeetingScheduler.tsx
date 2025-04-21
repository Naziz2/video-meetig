import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Plus, X, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { MeetingFormData } from '../types/meeting';
import { useNavigate } from 'react-router-dom';

interface MeetingSchedulerProps {
  compact?: boolean;
  onScheduleComplete?: () => void;
  className?: string;
}

export const MeetingScheduler = ({ 
  compact = false, 
  onScheduleComplete,
  className = '' 
}: MeetingSchedulerProps) => {
  const { user } = useStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [contacts, setContacts] = useState<{ id: string; name: string; email: string }[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    description: '',
    start_time: new Date(new Date().setMinutes(Math.ceil(new Date().getMinutes() / 15) * 15)).toISOString().slice(0, 16),
    end_time: new Date(new Date().setMinutes(Math.ceil(new Date().getMinutes() / 15) * 15 + 30)).toISOString().slice(0, 16),
    participants: [],
    recurring: false,
    recurrence_pattern: 'weekly',
    is_private: false
  });
  
  // Load user contacts for participants selection
  useEffect(() => {
    const loadContacts = async () => {
      if (!user) return;
      
      try {
        // In a real app, this would fetch the user's contacts or organization members
        // For this demo, we'll just fetch some random users
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email')
          .neq('id', user.id)
          .limit(10);
          
        if (error) throw error;
        
        if (data) {
          setContacts(data);
        }
      } catch (err) {
        console.error('Error loading contacts:', err);
      }
    };
    
    loadContacts();
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'recurring') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const toggleParticipant = (participantId: string) => {
    if (selectedParticipants.includes(participantId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== participantId));
    } else {
      setSelectedParticipants([...selectedParticipants, participantId]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/auth');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update the formData with selected participants
      const updatedFormData = {
        ...formData,
        participants: selectedParticipants
      };
      
      // Generate a unique meeting link
      const room_id = Math.random().toString(36).substring(2, 15);
      const meeting_link = `${window.location.origin}/join?room=${room_id}`;
      
      // Save to database
      const { error } = await supabase
        .from('meetings')
        .insert({
          title: updatedFormData.title,
          description: updatedFormData.description,
          start_time: updatedFormData.start_time,
          end_time: updatedFormData.end_time,
          room_id,
          host_id: user.id,
          participants: updatedFormData.participants,
          recurring: updatedFormData.recurring,
          recurrence_pattern: updatedFormData.recurring ? updatedFormData.recurrence_pattern : null,
          status: 'scheduled',
          is_private: updatedFormData.is_private,
          meeting_link,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setSuccess('Meeting scheduled successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        start_time: new Date(new Date().setMinutes(Math.ceil(new Date().getMinutes() / 15) * 15)).toISOString().slice(0, 16),
        end_time: new Date(new Date().setMinutes(Math.ceil(new Date().getMinutes() / 15) * 15 + 30)).toISOString().slice(0, 16),
        participants: [],
        recurring: false,
        recurrence_pattern: 'weekly',
        is_private: false
      });
      setSelectedParticipants([]);
      
      if (onScheduleComplete) {
        onScheduleComplete();
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className={`bg-theme-card rounded-2xl p-6 border border-theme ${className}`}>
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Calendar className="mr-2 w-5 h-5 text-theme-button" />
        Schedule a Meeting
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-700 rounded-lg flex items-start">
          <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-green-300 text-sm">{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-gray-300 text-sm font-medium mb-1">
            Meeting Title*
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full bg-secondary-800 text-white border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-button"
            placeholder="Weekly Team Standup"
          />
        </div>
        
        {!compact && (
          <div>
            <label htmlFor="description" className="block text-gray-300 text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full bg-secondary-800 text-white border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-button"
              placeholder="Discuss weekly progress and upcoming tasks..."
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_time" className="block text-gray-300 text-sm font-medium mb-1">
              Start Time*
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleInputChange}
                required
                className="w-full bg-secondary-800 text-white border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-button"
              />
              <Clock className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label htmlFor="end_time" className="block text-gray-300 text-sm font-medium mb-1">
              End Time*
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleInputChange}
                required
                className="w-full bg-secondary-800 text-white border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-button"
              />
              <Clock className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        {!compact && (
          <>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recurring"
                name="recurring"
                checked={formData.recurring}
                onChange={handleInputChange}
                className="w-4 h-4 bg-secondary-800 border border-slate-700 rounded focus:ring-theme-button text-theme-button"
              />
              <label htmlFor="recurring" className="text-gray-300 text-sm font-medium">
                Recurring Meeting
              </label>
            </div>
            
            {formData.recurring && (
              <div>
                <label htmlFor="recurrence_pattern" className="block text-gray-300 text-sm font-medium mb-1">
                  Repeat
                </label>
                <select
                  id="recurrence_pattern"
                  name="recurrence_pattern"
                  value={formData.recurrence_pattern}
                  onChange={handleInputChange}
                  className="w-full bg-secondary-800 text-white border border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme-button"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            )}
          </>
        )}
        
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">
            Participants
          </label>
          <div className="relative">
            <div className="flex items-center border border-slate-700 rounded-lg px-3 py-2 bg-secondary-800">
              <Users className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-white focus:outline-none"
                placeholder="Search people..."
              />
            </div>
            
            {/* Selected participants */}
            {selectedParticipants.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedParticipants.map(participantId => {
                  const participant = contacts.find(c => c.id === participantId);
                  return participant ? (
                    <div 
                      key={participant.id}
                      className="bg-theme-button/20 text-theme-button-text px-2 py-1 rounded-lg text-sm flex items-center"
                    >
                      <span>{participant.name}</span>
                      <button 
                        type="button"
                        onClick={() => toggleParticipant(participant.id)}
                        className="ml-2 text-gray-400 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            )}
            
            {/* Dropdown with filtered contacts */}
            {searchTerm && (
              <div className="absolute z-10 mt-1 w-full bg-secondary-800 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredContacts.length > 0 ? (
                  filteredContacts.map(contact => (
                    <div
                      key={contact.id}
                      className={`px-3 py-2 cursor-pointer flex items-center justify-between ${
                        selectedParticipants.includes(contact.id)
                          ? 'bg-theme-button/20 text-theme-button-text'
                          : 'text-white hover:bg-slate-700'
                      }`}
                      onClick={() => toggleParticipant(contact.id)}
                    >
                      <div>
                        <div>{contact.name}</div>
                        <div className="text-sm text-gray-400">{contact.email}</div>
                      </div>
                      {selectedParticipants.includes(contact.id) ? (
                        <Check className="w-5 h-5 text-theme-button" />
                      ) : (
                        <Plus className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-gray-400">No contacts found</div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {!compact && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_private"
              name="is_private"
              checked={formData.is_private}
              onChange={handleInputChange}
              className="w-4 h-4 bg-secondary-800 border border-slate-700 rounded focus:ring-theme-button text-theme-button"
            />
            <label htmlFor="is_private" className="text-gray-300 text-sm font-medium">
              Private Meeting (Only invited participants can join)
            </label>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-theme-button hover:bg-theme-button-hover text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Calendar className="w-5 h-5 mr-2" />
          )}
          Schedule Meeting
        </button>
      </form>
    </div>
  );
};
