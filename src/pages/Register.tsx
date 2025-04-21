import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { LucideVideo } from 'lucide-react';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useStore();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email.trim() || !password.trim() || !name.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      // Register with Supabase
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (authError) {
        console.error('Registration error:', authError);
        throw authError;
      }

      if (data && data.user) {
        console.log('Registration successful:', data.user.id);
        
        // Create a profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              name,
              email: data.user.email,
              created_at: new Date().toISOString(),
            },
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // Set user in store
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          name,
        });

        // Save user info to localStorage for persistence
        localStorage.setItem(`user_${data.user.id}`, name);

        // Create an empty roomIds array in localStorage if it doesn't exist
        if (!localStorage.getItem('roomIds')) {
          localStorage.setItem('roomIds', JSON.stringify([]));
        }

        // Redirect to profile page
        setTimeout(() => {
          navigate('/profile');
        }, 100);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-meeting-surface-dark flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-500 mb-4">
            <LucideVideo className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Create an account</h1>
          <p className="text-secondary-300 text-center">Join VideoMeet for free</p>
        </div>

        <div className="bg-meeting-panel-dark rounded-lg p-6 shadow-xl border border-secondary-800">
          {error && (
            <div className="mb-4 p-3 bg-danger-500/20 border border-danger-500/30 rounded-md">
              <p className="text-danger-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-meeting-control-dark text-white rounded-lg px-3 py-2 border border-secondary-700 focus:ring-2 focus:ring-wolt-blue focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-meeting-control-dark text-white rounded-lg px-3 py-2 border border-secondary-700 focus:ring-2 focus:ring-wolt-blue focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-meeting-control-dark text-white rounded-lg px-3 py-2 border border-secondary-700 focus:ring-2 focus:ring-wolt-blue focus:border-transparent"
                placeholder="Create a password (min. 6 characters)"
                required
              />
              <p className="mt-1 text-xs text-secondary-400">
                Must be at least 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-300">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-400 hover:text-primary-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 