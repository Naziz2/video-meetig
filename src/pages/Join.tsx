import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Join = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCredentials } = useStore();
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomId(roomParam);
      setCredentials('0146cc8be73b4b24b20485c2131e2f12', roomParam, null);
      navigate(`/room/${roomParam}`);
    }
  }, [location, navigate, setCredentials]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      setCredentials('0146cc8be73b4b24b20485c2131e2f12', roomId, null);
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-indigo-600 mb-6 hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>
        <div className="flex items-center justify-center mb-8">
          <Video className="w-12 h-12 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">Join Meeting</h1>
        <p className="text-gray-600 text-center mb-8">Enter the meeting code to join</p>
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Code
            </label>
            <input
              type="text"
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter meeting code"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Join Meeting
          </button>
        </form>
      </div>
    </div>
  );
};