import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, User, Lock, Bell, Shield, LogOut, AlertCircle, Globe, Calendar, CheckCircle, XCircle, Sun, Moon, Type } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { MeetingScheduler } from '../components/MeetingScheduler';
import { MeetingsList } from '../components/MeetingsList';

interface SocialLink {
  platform: string;
  url: string;
}

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  profile_slug: string;
  visibility: 'public' | 'private';
  social_links: SocialLink[];
  theme: 'light' | 'dark';
  email_notifications: boolean;
  meeting_reminders: boolean;
  sound_effects: boolean;
  reduced_motion: boolean;
  font_size: 'small' | 'medium' | 'large';
}

export const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearUser, setUser, settings, updateSettings } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    bio: '',
    profile_slug: '',
    visibility: 'private',
    social_links: [],
    theme: settings.theme || 'dark',
    email_notifications: settings.emailNotifications || true,
    meeting_reminders: settings.meetingReminders || true,
    sound_effects: settings.soundEffects || true,
    reduced_motion: settings.reducedMotion || false,
    font_size: settings.fontSize || 'medium'
  });
  const [newSocialLink, setNewSocialLink] = useState<SocialLink>({ platform: '', url: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [completionProgress, setCompletionProgress] = useState(0);

  // Calculate profile completion progress
  const calculateProgress = (data: ProfileData) => {
    let progress = 0;
    if (data.name) progress += 20;
    if (data.bio) progress += 20;
    if (data.profile_slug) progress += 20;
    if (data.social_links.length > 0) progress += 20;
    if (data.visibility) progress += 20;
    return progress;
  };

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfileData({
            name: data.name || user.name || '',
            email: user.email || '',
            bio: data.bio || '',
            profile_slug: data.profile_slug || '',
            visibility: data.visibility || 'private',
            social_links: data.social_links || [],
            theme: data.theme || 'dark',
            email_notifications: data.email_notifications || true,
            meeting_reminders: data.meeting_reminders || true,
            sound_effects: data.sound_effects || true,
            reduced_motion: data.reduced_motion || false,
            font_size: data.font_size || 'medium'
          });
          setCompletionProgress(calculateProgress(data));
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };

    loadProfileData();
  }, [user]);

  useEffect(() => {
    // Check if there's a tab query parameter
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      setError(null);
      setSuccess(null);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      clearUser();
      setSuccess('Signed out successfully');
      
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during sign out';
      setError(errorMessage);
      console.error('Error during sign out:', err);
      setIsSigningOut(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Update local user state
      if (user) {
        setUser({
          ...user,
          avatar_url: publicUrl
        });
      }

      setSuccess('Profile picture updated successfully');
      
      // Clear the image preview after successful upload
      setTimeout(() => {
        setImagePreview(null);
      }, 2000);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Profile picture upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Validate data
      if (!profileData.name.trim()) {
        setError('Name cannot be empty');
        return;
      }

      // If profile slug is provided, ensure it's URL-friendly
      if (profileData.profile_slug) {
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(profileData.profile_slug)) {
          setError('Profile URL can only contain lowercase letters, numbers, and hyphens');
          return;
        }
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          bio: profileData.bio,
          profile_slug: profileData.profile_slug,
          visibility: profileData.visibility,
          social_links: profileData.social_links,
          theme: profileData.theme,
          email_notifications: profileData.email_notifications,
          meeting_reminders: profileData.meeting_reminders,
          sound_effects: profileData.sound_effects,
          reduced_motion: profileData.reduced_motion,
          font_size: profileData.font_size,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Update user in Supabase Auth if name changed
      if (user?.name !== profileData.name) {
        const { error: userUpdateError } = await supabase.auth.updateUser({
          data: { name: profileData.name }
        });
        
        if (userUpdateError) {
          console.warn('Could not update auth user name:', userUpdateError);
        }
      }

      // Update local user state
      if (user) {
        setUser({
          ...user,
          name: profileData.name
        });
      }

      setSuccess('Profile updated successfully');
      setCompletionProgress(calculateProgress(profileData));
      
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Profile update error:', err);
    }
  };

  const handleBioChange = async (content: string) => {
    try {
      setError(null);
      setSuccess(null);
      
      // Update local state immediately for better UX
      setProfileData(prev => ({ ...prev, bio: content }));
      
      // Update in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ bio: content })
        .eq('id', user?.id);

      if (error) throw error;
      
      setSuccess('Bio updated successfully');
    } catch (err) {
      setError('Failed to update bio. Please try again.');
      // Revert local state on error
      setProfileData(prev => ({ ...prev, bio: prev.bio }));
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
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    }
  };

  const addSocialLink = () => {
    if (newSocialLink.platform && newSocialLink.url) {
      setProfileData({
        ...profileData,
        social_links: [...profileData.social_links, newSocialLink]
      });
      setNewSocialLink({ platform: '', url: '' });
    }
  };

  const removeSocialLink = (index: number) => {
    setProfileData({
      ...profileData,
      social_links: profileData.social_links.filter((_, i) => i !== index)
    });
  };

  if (!user && !isSigningOut) {
    navigate('/', { replace: true });
    return null;
  }

  if (isSigningOut) {
    return null;
  }

  const currentUser = user!;

  return (
    <div className="min-h-screen bg-theme-gradient pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-3">
            <div className="bg-theme-card rounded-2xl p-6 border border-theme">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {imagePreview ? (
                    <ReactCrop
                      crop={crop}
                      onChange={c => setCrop(c)}
                      aspect={1}
                      className="w-24 h-24 rounded-full"
                    >
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    </ReactCrop>
                  ) : (
                    <img
                      src={currentUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-2 border-slate-700"
                    />
                  )}
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
                <h2 className="mt-4 text-xl font-semibold text-white">{profileData.name || currentUser.name}</h2>
                <p className="text-gray-400 text-sm">Member since {new Date(currentUser.created_at || Date.now()).toLocaleDateString()}</p>
                
                {/* Profile Completion Progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                    <span>Profile Completion</span>
                    <span>{completionProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-theme-button h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionProgress}%` }}
                    />
                  </div>
                </div>
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
                  onClick={() => setActiveTab('meetings')}
                  className={`w-full flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === 'meetings'
                      ? 'bg-theme-button text-white'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  Meetings
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
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-4 py-2 text-sm rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </nav>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-9">
            {/* Show success/error messages */}
            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-lg p-4 flex items-start">
                <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-green-300">{success}</p>
              </div>
            )}
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-6">Profile Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Profile URL
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-slate-800/50 border border-r-0 border-slate-700 rounded-l-lg text-gray-400">
                      meetflow.com/
                    </span>
                    <input
                      type="text"
                      value={profileData.profile_slug}
                      onChange={(e) => setProfileData({ ...profileData, profile_slug: e.target.value })}
                      className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-r-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                      placeholder="your-profile"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleBioChange(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-600 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Social Media Links
                  </label>
                  <div className="space-y-4">
                    {profileData.social_links.map((link, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={link.platform}
                          onChange={(e) => {
                            const newLinks = [...profileData.social_links];
                            newLinks[index] = { ...link, platform: e.target.value };
                            setProfileData({ ...profileData, social_links: newLinks });
                          }}
                          className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                          placeholder="Platform"
                        />
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => {
                            const newLinks = [...profileData.social_links];
                            newLinks[index] = { ...link, url: e.target.value };
                            setProfileData({ ...profileData, social_links: newLinks });
                          }}
                          className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                          placeholder="URL"
                        />
                        <button
                          type="button"
                          onClick={() => removeSocialLink(index)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSocialLink.platform}
                        onChange={(e) => setNewSocialLink({ ...newSocialLink, platform: e.target.value })}
                        className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                        placeholder="Platform"
                      />
                      <input
                        type="url"
                        value={newSocialLink.url}
                        onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
                        className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-slate-600"
                        placeholder="URL"
                      />
                      <button
                        type="button"
                        onClick={addSocialLink}
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Profile Visibility
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, visibility: 'public' })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        profileData.visibility === 'public'
                          ? 'bg-theme-button text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <Globe className="w-5 h-5 mr-2" />
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, visibility: 'private' })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        profileData.visibility === 'private'
                          ? 'bg-theme-button text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <Shield className="w-5 h-5 mr-2" />
                      Private
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Theme
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, theme: 'light' })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        profileData.theme === 'light'
                          ? 'bg-theme-button text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <Sun className="w-5 h-5 mr-2" />
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, theme: 'dark' })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        profileData.theme === 'dark'
                          ? 'bg-theme-button text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <Moon className="w-5 h-5 mr-2" />
                      Dark
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Email Notifications
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, email_notifications: true })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        profileData.email_notifications
                          ? 'bg-theme-button text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Enabled
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, email_notifications: false })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        !profileData.email_notifications
                          ? 'bg-theme-button text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Disabled
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Meeting Reminders
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, meeting_reminders: true })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        profileData.meeting_reminders
                          ? 'bg-theme-button text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Enabled
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, meeting_reminders: false })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        !profileData.meeting_reminders
                          ? 'bg-theme-button text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Disabled
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Sound Effects
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, sound_effects: true })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        profileData.sound_effects
                          ? 'bg-theme-button text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Enabled
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, sound_effects: false })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        !profileData.sound_effects
                          ? 'bg-theme-button text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Disabled
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Reduced Motion
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, reduced_motion: true })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        profileData.reduced_motion
                          ? 'bg-theme-button text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Enabled
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, reduced_motion: false })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        !profileData.reduced_motion
                          ? 'bg-theme-button text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Disabled
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Font Size
                  </label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, font_size: 'small' })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        profileData.font_size === 'small'
                          ? 'bg-theme-button text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <Type className="w-5 h-5 mr-2" />
                      Small
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, font_size: 'medium' })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        profileData.font_size === 'medium'
                          ? 'bg-theme-button text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <Type className="w-5 h-5 mr-2" />
                      Medium
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileData({ ...profileData, font_size: 'large' })}
                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                        profileData.font_size === 'large'
                          ? 'bg-theme-button text-white'
                          : 'bg-slate-800/50 text-gray-400 hover:text-white hover:bg-slate-800/70'
                      }`}
                    >
                      <Type className="w-5 h-5 mr-2" />
                      Large
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-theme-button hover:bg-theme-button-hover text-white rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
            
            {/* Security Tab */}
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
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Notification Preferences</h3>
                {/* Add notification settings content */}
              </div>
            )}
            
            {/* Meetings Tab */}
            {activeTab === 'meetings' && (
              <div className="space-y-6">
                <div className="bg-theme-card rounded-2xl p-6 border border-theme">
                  <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                    <Calendar className="mr-2 w-5 h-5 text-theme-button" />
                    Schedule a Meeting
                  </h2>
                  <MeetingScheduler />
                </div>
                
                <MeetingsList showAll={true} />
              </div>
            )}
            
            {/* Privacy Tab */}
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
  );
};