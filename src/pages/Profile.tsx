import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mail, User, Lock, Bell, Shield, LogOut, Upload, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, clearUser, setUser } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSignOut = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
        throw error;
      }

      // Clear user state
      clearUser();

      // Navigate to home page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force navigation even if there's an error
      navigate('/', { replace: true });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordData.currentPassword
      });

      if (signInError) {
        setError('Current password is incorrect');
        return;
      }

      // If current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) throw updateError;

      setSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Update local user state
      setUser({
        ...user!,
        avatar_url: publicUrl
      });

      setSuccess('Profile picture updated successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Redirect to auth if no user
  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-theme-gradient pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-3">
            <div className="bg-theme-card rounded-2xl p-6 border border-theme">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-2 border-slate-700"
                  />
                  <label className="absolute bottom-0 right-0 p-2 bg-theme-button hover:bg-theme-button-hover rounded-full text-white cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </label>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-white">{user.name}</h2>
                <p className="text-gray-400 text-sm">Member since {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-theme-button text-white'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <User className="w-5 h-5 mr-3" />
                  Profile Information
                </button>
                
                <button
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === 'security'
                      ? 'bg-theme-button text-white'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Lock className="w-5 h-5 mr-3" />
                  Security
                </button>
                
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === 'notifications'
                      ? 'bg-theme-button text-white'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Bell className="w-5 h-5 mr-3" />
                  Notifications
                </button>
                
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === 'privacy'
                      ? 'bg-theme-button text-white'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Shield className="w-5 h-5 mr-3" />
                  Privacy
                </button>
              </nav>
              
              <div className="mt-6 pt-6 border-t border-slate-700">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-9">
            <div className="bg-theme-card rounded-2xl p-6 border border-theme">
              {error && (
                <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-start">
                  <Upload className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-green-300">{success}</p>
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6">Profile Information</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={user.name}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Bio
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button className="px-6 py-2 bg-theme-button hover:bg-theme-button-hover text-white rounded-lg transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'security' && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6">Security Settings</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-theme-button hover:bg-theme-button-hover text-white rounded-lg transition-colors"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {activeTab === 'notifications' && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6">Notification Preferences</h3>
                  {/* Add notification settings content */}
                </div>
              )}
              
              {activeTab === 'privacy' && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-6">Privacy Settings</h3>
                  {/* Add privacy settings content */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};