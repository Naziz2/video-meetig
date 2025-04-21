import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, Mic, Volume2, Monitor, Bell, Moon, Sun, Save, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings: storedSettings, updateSettings } = useStore();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Get the previous path from location state
  const previousPath = location.state?.from || '/';
  
  // Audio/Video settings
  const [videoInput, setVideoInput] = useState(storedSettings?.videoInput || 'default');
  const [audioInput, setAudioInput] = useState(storedSettings?.audioInput || 'default');
  const [audioOutput, setAudioOutput] = useState(storedSettings?.audioOutput || 'default');
  const [videoQuality, setVideoQuality] = useState<'360p' | '480p' | '720p' | '1080p'>(
    storedSettings?.videoQuality || '720p'
  );
  
  // Appearance settings
  const [theme, setTheme] = useState<'light' | 'dark'>(storedSettings?.theme || 'dark');
  const [reducedMotion, setReducedMotion] = useState(storedSettings?.reducedMotion || false);
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(storedSettings?.fontSize || 'medium');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(storedSettings?.emailNotifications ?? true);
  const [meetingReminders, setMeetingReminders] = useState(storedSettings?.meetingReminders ?? true);
  const [soundEffects, setSoundEffects] = useState(storedSettings?.soundEffects ?? true);
  
  useEffect(() => {
    // Update local state when stored settings change
    if (storedSettings) {
      setVideoInput(storedSettings.videoInput || 'default');
      setAudioInput(storedSettings.audioInput || 'default');
      setAudioOutput(storedSettings.audioOutput || 'default');
      setVideoQuality(storedSettings.videoQuality || '720p');
      setTheme(storedSettings.theme || 'dark');
      setReducedMotion(storedSettings.reducedMotion || false);
      setFontSize(storedSettings.fontSize || 'medium');
      setEmailNotifications(storedSettings.emailNotifications ?? true);
      setMeetingReminders(storedSettings.meetingReminders ?? true);
      setSoundEffects(storedSettings.soundEffects ?? true);
    }
  }, [storedSettings]);
  
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Save settings to store
      updateSettings({
        videoInput,
        audioInput,
        audioOutput,
        videoQuality,
        theme,
        reducedMotion,
        fontSize,
        emailNotifications,
        meetingReminders,
        soundEffects,
        notifications: emailNotifications || meetingReminders // Ensure notifications field is updated
      });
      
      // Show success message
      setSuccess(true);
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate(previousPath);
      }, 1500);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-wolt-blue via-wolt-teal to-wolt-blue bg-clip-text text-transparent">
              Settings
            </span>
          </h1>
          <button
            onClick={() => navigate(previousPath)}
            className="px-4 py-2 text-secondary-600 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white"
          >
            Back
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300 flex items-center">
            <Save className="w-5 h-5 mr-2 flex-shrink-0" />
            <p>Settings saved successfully!</p>
          </div>
        )}
        
        <form onSubmit={handleSaveSettings} className="space-y-8">
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-secondary-700">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-wolt-blue">Audio & Video</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-wolt-teal" />
                      Camera
                    </div>
                  </label>
                  <select
                    value={videoInput}
                    onChange={(e) => setVideoInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-secondary-700 border border-gray-300 dark:border-secondary-600 text-secondary-900 dark:text-white focus:ring-2 focus:ring-wolt-blue focus:border-transparent"
                  >
                    <option value="default">Default Camera</option>
                    <option value="camera1">Camera 1</option>
                    <option value="camera2">Camera 2</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    <div className="flex items-center gap-2">
                      <Mic className="w-4 h-4 text-wolt-teal" />
                      Microphone
                    </div>
                  </label>
                  <select
                    value={audioInput}
                    onChange={(e) => setAudioInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-secondary-700 border border-gray-300 dark:border-secondary-600 text-secondary-900 dark:text-white focus:ring-2 focus:ring-wolt-blue focus:border-transparent"
                  >
                    <option value="default">Default Microphone</option>
                    <option value="mic1">Microphone 1</option>
                    <option value="mic2">Microphone 2</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-wolt-teal" />
                      Speakers
                    </div>
                  </label>
                  <select
                    value={audioOutput}
                    onChange={(e) => setAudioOutput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-secondary-700 border border-gray-300 dark:border-secondary-600 text-secondary-900 dark:text-white focus:ring-2 focus:ring-wolt-blue focus:border-transparent"
                  >
                    <option value="default">Default Speakers</option>
                    <option value="speaker1">Speaker 1</option>
                    <option value="speaker2">Speaker 2</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-wolt-teal" />
                      Video Quality
                    </div>
                  </label>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">Video Quality</label>
                    <select
                      value={videoQuality}
                      onChange={(e) => setVideoQuality(e.target.value as '360p' | '480p' | '720p' | '1080p')}
                      className="w-full bg-meeting-panel-dark text-white rounded-lg px-3 py-2 border border-secondary-700 focus:ring-2 focus:ring-wolt-blue focus:border-transparent"
                    >
                      <option value="360p">360p (640x360) - Low</option>
                      <option value="480p">480p (848x480) - Medium</option>
                      <option value="720p">720p (1280x720) - High</option>
                      <option value="1080p">1080p (1920x1080) - Ultra HD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-secondary-700">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-wolt-blue">Appearance</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {theme === 'dark' ? (
                        <Moon className="w-5 h-5 text-wolt-teal" />
                      ) : (
                        <Sun className="w-5 h-5 text-wolt-teal" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Theme</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">Choose between light and dark mode</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setTheme('light')}
                      className={`px-3 py-1 rounded-md ${
                        theme === 'light' 
                          ? 'bg-wolt-blue text-white' 
                          : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300'
                      }`}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme('dark')}
                      className={`px-3 py-1 rounded-md ${
                        theme === 'dark' 
                          ? 'bg-wolt-blue text-white' 
                          : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300'
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <span className="inline-block w-5 h-5 text-center text-wolt-teal">Aa</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Font Size</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">Adjust the text size for better readability</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setFontSize('small')}
                      className={`px-3 py-1 rounded-md ${
                        fontSize === 'small' 
                          ? 'bg-wolt-blue text-white' 
                          : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300'
                      }`}
                    >
                      Small
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize('medium')}
                      className={`px-3 py-1 rounded-md ${
                        fontSize === 'medium' 
                          ? 'bg-wolt-blue text-white' 
                          : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300'
                      }`}
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontSize('large')}
                      className={`px-3 py-1 rounded-md ${
                        fontSize === 'large' 
                          ? 'bg-wolt-blue text-white' 
                          : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300'
                      }`}
                    >
                      Large
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-3">
                      <span className="inline-block w-5 h-5 text-center text-wolt-teal">⚡</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Reduced Motion</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">Minimize animations throughout the interface</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={reducedMotion}
                      onChange={() => setReducedMotion(!reducedMotion)}
                    />
                    <div className="w-11 h-6 bg-secondary-200 dark:bg-secondary-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-wolt-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 dark:after:border-secondary-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wolt-blue"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-secondary-700">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-wolt-blue">Notifications</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 text-wolt-teal mr-3" />
                    <div>
                      <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Email Notifications</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">Receive meeting invites and updates via email</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={emailNotifications}
                      onChange={() => setEmailNotifications(!emailNotifications)}
                    />
                    <div className="w-11 h-6 bg-secondary-200 dark:bg-secondary-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-wolt-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 dark:after:border-secondary-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wolt-blue"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Bell className="w-5 h-5 text-wolt-teal mr-3" />
                    <div>
                      <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Meeting Reminders</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">Get notifications before scheduled meetings</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={meetingReminders}
                      onChange={() => setMeetingReminders(!meetingReminders)}
                    />
                    <div className="w-11 h-6 bg-secondary-200 dark:bg-secondary-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-wolt-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 dark:after:border-secondary-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wolt-blue"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Volume2 className="w-5 h-5 text-wolt-teal mr-3" />
                    <div>
                      <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Sound Effects</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">Play sounds for notifications and events</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={soundEffects}
                      onChange={() => setSoundEffects(!soundEffects)}
                    />
                    <div className="w-11 h-6 bg-secondary-200 dark:bg-secondary-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-wolt-blue rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 dark:after:border-secondary-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-wolt-blue"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full px-6 py-3 bg-wolt-blue hover:bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};