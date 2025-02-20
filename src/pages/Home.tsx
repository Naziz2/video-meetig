import { useNavigate } from 'react-router-dom';
import { Video, Users, Shield, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Home = () => {
  const navigate = useNavigate();
  const { setCredentials } = useStore();

  const handleCreateMeeting = () => {
    const roomId = Math.random().toString(36).substring(7);
    setCredentials('0146cc8be73b4b24b20485c2131e2f12', roomId, null);
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Professional Video Conferencing for Everyone
          </h1>
          <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
            High-quality video meetings with advanced features for teams of all sizes
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleCreateMeeting}
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition"
            >
              Start New Meeting
            </button>
            <button
              onClick={() => navigate('/join')}
              className="px-8 py-4 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-800 transition"
            >
              Join Meeting
            </button>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-white">
            <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">HD Video Meetings</h3>
            <p className="text-indigo-100">Crystal clear video and audio for up to 100 participants</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-white">
            <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Meetings</h3>
            <p className="text-indigo-100">End-to-end encryption for all your meetings</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 text-white">
            <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Meetings</h3>
            <p className="text-indigo-100">Start or join meetings with just one click</p>
          </div>
        </div>
      </div>
    </div>
  );
};