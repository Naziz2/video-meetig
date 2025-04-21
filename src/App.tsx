import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { Join } from './pages/Join';
import { Room } from './pages/Room';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Pricing } from './pages/Pricing';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { Contact } from './pages/Contact';
import { Features } from './pages/Features';
import { Security } from './pages/Security';
import { Blog } from './pages/Blog';
import { About } from './pages/About';
import { EmailVerification } from './pages/EmailVerification';
import SupabaseTestPage from './pages/SupabaseTestPage';
import TranscriptsTestPage from './pages/TranscriptsTestPage';

import { ThemeProvider } from './lib/ThemeContext';

// Wrapper component to conditionally render the Navbar
const AppContent = () => {
  const { user, setUser } = useStore();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        if (!isSupabaseConfigured()) {
          console.warn('Supabase not properly configured. Skipping auth check.');
          return;
        }
        
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error checking session:', error);
          setAuthError('Failed to connect to authentication service');
          return;
        }
        
        if (data && data.session) {
          try {
            // Get user profile data
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();
              
            if (profileError) {
              console.error('Error fetching profile:', profileError);
              
              // If profile doesn't exist, create one
              if (profileError.code === 'PGRST116') {
                // Create a new profile
                const { error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    id: data.session.user.id,
                    name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
                    email: data.session.user.email || '',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                
                if (createError) {
                  console.error('Error creating profile:', createError);
                } else {
                  console.log('Created new profile for user');
                  
                  // Fetch the newly created profile
                  const { data: newProfileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.session.user.id)
                    .single();
                    
                  // Set user in store with new profile data
                  setUser({
                    id: data.session.user.id,
                    email: data.session.user.email || '',
                    name: newProfileData?.name || data.session.user.email?.split('@')[0] || 'User',
                    avatar_url: newProfileData?.avatar_url,
                    created_at: newProfileData?.created_at
                  });
                  
                  return;
                }
              }
            }
    
            // Set user in store with complete profile data
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || '',
              name: profileData?.name || data.session.user.email?.split('@')[0] || 'User',
              avatar_url: profileData?.avatar_url,
              created_at: profileData?.created_at,
              role: profileData?.role
            });
            
            // Update settings from profile if available
            if (profileData) {
              const { updateSettings } = useStore.getState();
              updateSettings({
                theme: profileData.theme,
                reducedMotion: profileData.reduced_motion,
                fontSize: profileData.font_size,
                emailNotifications: profileData.email_notifications,
                meetingReminders: profileData.meeting_reminders,
                soundEffects: profileData.sound_effects
              });
            }
          } catch (profileError) {
            console.error('Error in profile fetch:', profileError);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        setAuthError('Failed to connect to authentication service');
      }
    };

    checkSession();

    // Listen for auth changes
    let subscription: { unsubscribe: () => void } | undefined;
    try {
      if (isSupabaseConfigured()) {
        const { data } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            try {
              if (event === 'SIGNED_IN' && session) {
                // Get user profile data
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', session.user.id)
                  .single();
      
                // Set user in store with complete profile data
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: profileData?.name || session.user.email?.split('@')[0] || 'User',
                  avatar_url: profileData?.avatar_url,
                  created_at: profileData?.created_at,
                  role: profileData?.role
                });
                
                // Update settings from profile if available
                if (profileData) {
                  const { updateSettings } = useStore.getState();
                  updateSettings({
                    theme: profileData.theme,
                    reducedMotion: profileData.reduced_motion,
                    fontSize: profileData.font_size,
                    emailNotifications: profileData.email_notifications,
                    meetingReminders: profileData.meeting_reminders,
                    soundEffects: profileData.sound_effects
                  });
                }
              } else if (event === 'SIGNED_OUT') {
                setUser(null);
              }
            } catch (error) {
              console.error('Auth state change error:', error);
            }
          }
        );
        subscription = data.subscription;
      }
    } catch (error) {
      console.error('Auth subscription error:', error);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [setUser]);

  const isRoomPage = location.pathname.includes('/room/');
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white transition-colors duration-200">
      {!isRoomPage && !isAuthPage && <Navbar />}
      <main className="flex-grow">
        {authError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{authError}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <button onClick={() => setAuthError(null)}>
                <span className="sr-only">Close</span>
                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                </svg>
              </button>
            </span>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join" element={<Join />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={
            user ? <Profile /> : <Navigate to="/auth" replace />
          } />
          <Route path="/room/:id" element={<Room />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/settings" element={
            user ? <Settings /> : <Navigate to="/auth" replace />
          } />
          <Route path="/auth" element={<Auth />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/features" element={<Features />} />
          <Route path="/security" element={<Security />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<About />} />
          <Route path="/supabase-test" element={<SupabaseTestPage />} />
          <Route path="/transcripts-test" element={<TranscriptsTestPage />} />
        </Routes>
      </main>
      {!isRoomPage && !isAuthPage && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}