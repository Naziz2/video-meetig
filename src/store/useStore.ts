import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JoinRequest } from '../types/room';

interface User {
  id: string;
  email: string;
  name: string;
  role?: 'leader' | 'participant';
  avatar_url?: string;
  created_at?: string;
  bio?: string;
  profile_slug?: string;
  visibility?: 'public' | 'private';
}

export interface Settings {
  videoQuality: '360p' | '480p' | '720p' | '1080p';
  audioInput: string;
  videoInput: string;
  audioOutput: string;
  agoraAppCertificate: string;
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
  joinRequests: JoinRequest[];
  pendingApproval: boolean;
  setCredentials: (appId: string, channel: string, token: string | null) => void;
  setChannel: (channel: string) => void;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setSettings: (settings: Partial<Settings>) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  addJoinRequest: (request: JoinRequest) => void;
  updateJoinRequest: (requestId: string, status: 'approved' | 'rejected') => void;
  setPendingApproval: (pending: boolean) => void;
}

// Helper function to save join requests to localStorage
const saveJoinRequestsToLocalStorage = (requests: JoinRequest[]) => {
  localStorage.setItem('joinRequests', JSON.stringify(requests));
};

// Helper function to get join requests from localStorage
const getJoinRequestsFromLocalStorage = (): JoinRequest[] => {
  const requests = localStorage.getItem('joinRequests');
  return requests ? JSON.parse(requests) : [];
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      appId: 'ac5d59b2934e4e418409960fe08d20a4',
      channel: 'test',
      token: null,
      uid: Math.floor(Math.random() * 10000),
      user: null,
      joinRequests: getJoinRequestsFromLocalStorage(),
      pendingApproval: false,
      settings: {
        videoQuality: '720p',
        audioInput: 'default',
        videoInput: 'default',
        audioOutput: 'default',
        agoraAppCertificate: '',
        theme: 'dark',
        reducedMotion: false,
        fontSize: 'medium',
        emailNotifications: true,
        meetingReminders: true,
        soundEffects: true,
        notifications: true,
      },
      setCredentials: (appId, channel, token) => {
        console.log('Setting credentials:', { appId, channel, token });
        set({ appId, channel, token });
      },
      setChannel: (channel) => set({ channel }),
      setUser: (user) => {
        console.log('Setting user:', user);
        set({ user });
      },
      clearUser: () => set({ user: null }),
      setSettings: (settings) => set({ settings: settings as Settings }),
      updateSettings: (newSettings) => 
        set((state) => ({ 
          settings: { 
            ...state.settings, 
            ...newSettings 
          } 
        })),
      addJoinRequest: (request) => {
        console.log('Adding join request to store:', request);
        
        // Get existing requests from localStorage
        const existingRequests = getJoinRequestsFromLocalStorage();
        
        // Add the new request
        const updatedRequests = [...existingRequests, request];
        
        // Save to localStorage
        saveJoinRequestsToLocalStorage(updatedRequests);
        
        // Update the store
        set({ joinRequests: updatedRequests });
        
        console.log('Updated join requests array:', updatedRequests);
        
        // Debug: Verify the request was added
        setTimeout(() => {
          const currentRequests = getJoinRequestsFromLocalStorage();
          console.log('Current join requests after add (from localStorage):', currentRequests);
        }, 100);
      },
      updateJoinRequest: (requestId, status) => {
        console.log('Updating join request status:', { requestId, status });
        
        // Get existing requests from localStorage
        const existingRequests = getJoinRequestsFromLocalStorage();
        
        // Update the request status
        const updatedRequests = existingRequests.map(req => 
          req.id === requestId ? { ...req, status } : req
        );
        
        // Save to localStorage
        saveJoinRequestsToLocalStorage(updatedRequests);
        
        // Update the store
        set({ joinRequests: updatedRequests });
        
        console.log('Updated join requests after status change:', updatedRequests);
      },
      setPendingApproval: (pending) => {
        console.log('Setting pending approval:', pending);
        set({ pendingApproval: pending });
      },
    }),
    {
      name: 'meetflow-storage',
    }
  )
);