import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import { supabase } from './lib/supabase';
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
import { ThemeProvider } from './lib/ThemeContext';

// Wrapper component to conditionally render the Navbar
const AppContent = () => {
  const { user, setUser } = useStore();
  const location = useLocation();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data && data.session) {
        // Get user profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        // Set user in store
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: profileData?.name || data.session.user.email?.split('@')[0] || 'User',
        });
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get user profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          // Set user in store
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: profileData?.name || session.user.email?.split('@')[0] || 'User',
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  const isRoomPage = location.pathname.includes('/room/');
  const isAuthPage = location.pathname === '/auth' || location.pathname === '/register';

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white transition-colors duration-200">
      {!isRoomPage && !isAuthPage && <Navbar />}
      <main className="flex-grow">
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
          <Route path="/contact" element={<Contact />} />
          <Route path="/features" element={<Features />} />
          <Route path="/security" element={<Security />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<About />} />
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