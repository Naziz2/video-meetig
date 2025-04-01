import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role?: 'leader' | 'participant';
  avatar_url?: string;
  created_at?: string;
}

interface Settings {
  videoQuality: '360p' | '480p' | '720p' | '1080p';
  audioInput: string;
  videoInput: string;
  audioOutput?: string;
  theme?: 'light' | 'dark';
  reducedMotion?: boolean;
  fontSize?: 'small' | 'medium' | 'large';
  emailNotifications?: boolean;
  meetingReminders?: boolean;
  soundEffects?: boolean;
  notifications: boolean;
}

interface AppState {
  appId: string;
  channel: string;
  token: string | null;
  uid: number;
  user: User | null;
  settings: Settings;
  setCredentials: (appId: string, channel: string, token: string | null) => void;
  setChannel: (channel: string) => void;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setSettings: (settings: Partial<Settings>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      appId: '767291001f404b57a5ae8faa042478c6',
      channel: 'test',
      token: null,
      uid: Math.floor(Math.random() * 10000),
      user: null,
      settings: {
        videoQuality: '720p',
        audioInput: 'default',
        videoInput: 'default',
        audioOutput: 'default',
        theme: 'dark',
        reducedMotion: false,
        fontSize: 'medium',
        emailNotifications: true,
        meetingReminders: true,
        soundEffects: true,
        notifications: true,
      },
      setCredentials: (appId, channel, token) => set({ appId, channel, token }),
      setChannel: (channel) => set({ channel }),
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setSettings: (settings) => set({ settings: settings as Settings }),
      updateSettings: (newSettings) => 
        set((state) => ({ 
          settings: { 
            ...state.settings, 
            ...newSettings 
          } 
        })),
    }),
    {
      name: 'meetflow-storage',
    }
  )
);