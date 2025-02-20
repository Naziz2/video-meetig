import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import AgoraRTC from 'agora-rtc-sdk-ng';

export const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings: storedSettings, setSettings } = useStore();
  const [settings, setLocalSettings] = useState(storedSettings);
  const [devices, setDevices] = useState<{
    audioInputs: MediaDeviceInfo[];
    videoInputs: MediaDeviceInfo[];
  }>({
    audioInputs: [],
    videoInputs: []
  });

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await AgoraRTC.getDevices();
        setDevices({
          audioInputs: devices.audioInputs || [],
          videoInputs: devices.videoInputs || []
        });
      } catch (error) {
        console.error('Error getting devices:', error);
        setDevices({
          audioInputs: [],
          videoInputs: []
        });
      }
    };

    getDevices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(settings);
    // If we came from a room, go back to it
    if (location.state?.from?.startsWith('/room/')) {
      navigate(location.state.from);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Settings</h2>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Video Settings */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Video & Audio</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video Quality
                  </label>
                  <select
                    value={settings.videoQuality}
                    onChange={(e) => setLocalSettings({ ...settings, videoQuality: e.target.value as '360p' | '720p' | '1080p' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="360p">Low (360p)</option>
                    <option value="720p">Medium (720p)</option>
                    <option value="1080p">High (1080p)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Audio Input
                  </label>
                  <select
                    value={settings.audioInput}
                    onChange={(e) => setLocalSettings({ ...settings, audioInput: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="default">Default Microphone</option>
                    {devices.audioInputs.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video Input
                  </label>
                  <select
                    value={settings.videoInput}
                    onChange={(e) => setLocalSettings({ ...settings, videoInput: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="default">Default Camera</option>
                    {devices.videoInputs.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setLocalSettings({ ...settings, notifications: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Enable desktop notifications
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};