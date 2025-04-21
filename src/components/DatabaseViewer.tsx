import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const DatabaseViewer = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [transcripts, setTranscripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(10);

        if (messagesError) throw messagesError;

        // Fetch transcripts
        const { data: transcriptsData, error: transcriptsError } = await supabase
          .from('transcripts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (transcriptsError) throw transcriptsError;

        setMessages(messagesData || []);
        setTranscripts(transcriptsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Database Viewer</h2>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold mb-2">Messages ({messages.length})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Speaker</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Text</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {messages.map(message => (
                    <tr key={message.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{message.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{message.speaker}</td>
                      <td className="px-6 py-4">{message.text}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{message.channel}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(message.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Transcripts ({transcripts.length})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Speaker</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Text</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transcripts.map(transcript => (
                    <tr key={transcript.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{transcript.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{transcript.speaker}</td>
                      <td className="px-6 py-4">{transcript.text}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{transcript.room_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(transcript.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 