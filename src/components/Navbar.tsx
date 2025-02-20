import { Link, useLocation } from 'react-router-dom';
import { Video, Settings, LogIn, User } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Navbar = () => {
  const location = useLocation();
  const { user } = useStore();
  const isInRoom = location.pathname.startsWith('/room/');

  if (isInRoom) return null;

  return (
    <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Video className="w-8 h-8 text-emerald-500" />
            <span className="font-bold text-xl text-slate-100">MeetFlow</span>
          </Link>
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-slate-300 hover:text-emerald-400">Home</Link>
            <Link to="/pricing" className="text-slate-300 hover:text-emerald-400">Pricing</Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/settings" className="text-slate-300 hover:text-emerald-400">
                  <Settings className="w-5 h-5" />
                </Link>
                <Link to="/profile" className="text-slate-300 hover:text-emerald-400">
                  <User className="w-5 h-5" />
                </Link>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};