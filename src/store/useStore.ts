import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
}

interface Settings {
  videoQuality: '360p' | '720p' | '1080p';
  audioInput: string;
  videoInput: string;
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
  setUser: (user: User | null) => void;
  setSettings: (settings: Settings) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      appId: '0146cc8be73b4b24b20485c2131e2f12',
      channel: 'test',
      token: null,
      uid: Math.floor(Math.random() * 10000),
      user: null,
      settings: {
        videoQuality: '720p',
        audioInput: 'default',
        videoInput: 'default',
        notifications: true,
      },
      setCredentials: (appId, channel, token) => set({ appId, channel, token }),
      setUser: (user) => set({ user }),
      setSettings: (settings) => set({ settings }),
    }),
    {
      name: 'meetflow-storage',
    }
  )
);