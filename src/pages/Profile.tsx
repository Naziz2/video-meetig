import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Package } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  const [name, setName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name })
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, name });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-900 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 bg-slate-700">
            <h2 className="text-2xl font-bold text-slate-100">Profile Settings</h2>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Profile Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-400" />
                  Profile Information
                </h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    Edit
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-lg bg-slate-700 border-slate-600 text-slate-100 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setName(user.name);
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Name</p>
                      <p className="text-slate-100">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Email</p>
                      <p className="text-slate-100">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Subscription Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" />
                Current Plan
              </h3>
              <div className="bg-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-slate-100">Free Plan</h4>
                    <p className="text-slate-400 mt-1">Basic features for personal use</p>
                  </div>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Upgrade
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <ul className="space-y-2 text-slate-300">
                    <li>• Up to 3 participants</li>
                    <li>• 40 minutes limit per meeting</li>
                    <li>• Basic features included</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="pt-6 border-t border-slate-700">
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-red-400 hover:text-red-300"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};