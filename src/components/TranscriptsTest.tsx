import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from '../lib/supabase';

interface Transcript {
  id: number;
  text: string;
  speaker: string;
  room_id: string;
  timestamp: string;
  meeting_id?: string;
  created_at: string;
}

const TranscriptsTest: React.FC = () => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form states
  const [text, setText] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [roomId, setRoomId] = useState('');
  
  // Fetch transcripts
  const fetchTranscripts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isSupabaseConfigured()) {
        console.error('Supabase configuration error: Not properly configured');
        setError('Supabase is not properly configured. Please check your environment variables.');
        setLoading(false);
        return;
      }
      
      console.log('Fetching transcripts from Supabase...');
      
      const { data, error } = await supabase
        .from('transcripts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      
      console.log('Fetched transcripts:', data?.length || 0, 'records');
      setTranscripts(data || []);
      setSuccess(`Successfully fetched ${data?.length || 0} transcripts`);
    } catch (err: any) {
      console.error('Error fetching transcripts:', err);
      setError(err.message || 'An unknown error occurred while fetching transcripts');
    } finally {
      setLoading(false);
    }
  };
  
  // Add transcript
  const addTranscript = async () => {
    if (!text || !speaker || !roomId) {
      setError('Text, speaker, and room ID are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const newTranscript = {
        text,
        speaker,
        room_id: roomId,
        timestamp: new Date().toISOString()
      };
      
      console.log('Adding transcript:', newTranscript);
      
      const { error } = await supabase
        .from('transcripts')
        .insert([newTranscript]);
      
      if (error) throw error;
      
      setSuccess('Transcript added successfully');
      // Clear all form fields
      setText('');
      setSpeaker('');
      setRoomId('');
      // Refresh the list
      fetchTranscripts();
    } catch (err: any) {
      console.error('Error adding transcript:', err);
      setError(err.message || 'An unknown error occurred while adding transcript');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete transcript
  const deleteTranscript = async (id: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Deleting transcript with ID:', id);
      
      const { error } = await supabase
        .from('transcripts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setSuccess(`Transcript ${id} deleted successfully`);
      // Refresh the list
      fetchTranscripts();
    } catch (err: any) {
      console.error('Error deleting transcript:', err);
      setError(err.message || 'An unknown error occurred while deleting transcript');
    } finally {
      setLoading(false);
    }
  };
  
  // Check database structure
  const checkDatabaseStructure = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Checking database structure...');
      
      // This query will return information about the columns in the transcripts table
      const { data, error } = await supabase
        .from('transcripts')
        .select('*')
        .limit(1);
      
      if (error) {
        console.error('Error checking database structure:', error);
        throw error;
      }
      
      // Log the structure of the first record to see available columns
      if (data && data.length > 0) {
        console.log('Transcript table structure:', Object.keys(data[0]));
        setSuccess('Database structure checked successfully');
      } else {
        console.log('No records found in transcripts table');
        setSuccess('No records found in transcripts table');
      }
    } catch (err: any) {
      console.error('Error checking database structure:', err);
      setError(err.message || 'An unknown error occurred while checking database structure');
    } finally {
      setLoading(false);
    }
  };
  
  // Load transcripts on mount
  useEffect(() => {
    fetchTranscripts();
  }, []);
  
  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 dark:text-white">Transcripts Table Test</h2>
      
      {/* Connection Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Connection Status</h3>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isSupabaseConfigured() ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="dark:text-white">
            {isSupabaseConfigured() ? 'Supabase is configured' : 'Supabase is not configured'}
          </span>
        </div>
        <button
          onClick={checkDatabaseStructure}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Check Database Structure
        </button>
      </div>
      
      {/* Add Transcript Form */}
      <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Add New Transcript</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">Text*</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-slate-700 dark:text-white"
              rows={3}
              placeholder="Transcript text"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">Speaker*</label>
            <input
              type="text"
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-slate-700 dark:text-white"
              placeholder="Speaker name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">Room ID*</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-slate-700 dark:text-white"
              placeholder="Room ID"
            />
          </div>
          

        </div>
        
        <button
          onClick={addTranscript}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-gray-400"
        >
          {loading ? 'Adding...' : 'Add Transcript'}
        </button>
      </div>
      
      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          <p className="font-bold">Success:</p>
          <p>{success}</p>
        </div>
      )}
      
      {/* Transcripts List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold dark:text-white">Recent Transcripts</h3>
          <button
            onClick={fetchTranscripts}
            disabled={loading}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-sm"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        {transcripts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No transcripts found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Text</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Speaker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Room ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transcripts.map((transcript) => (
                  <tr key={transcript.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-white">{transcript.id}</td>
                    <td className="px-6 py-4 text-sm dark:text-white">
                      <div className="max-w-xs truncate">{transcript.text}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-white">{transcript.speaker}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-white">{transcript.room_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm dark:text-white">
                      {new Date(transcript.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => deleteTranscript(transcript.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptsTest;
