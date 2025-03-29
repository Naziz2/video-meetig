import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Join } from './pages/Join';
import { Room } from './pages/Room';
import { Pricing } from './pages/Pricing';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { Contact } from './pages/Contact';
import { Profile } from './pages/Profile';
import { ThemeProvider } from './lib/ThemeContext';

// Wrapper component to conditionally render the Navbar
const AppContent = () => {
  const location = useLocation();
  const isRoomPage = location.pathname.includes('/room/');

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white transition-colors duration-200">
      {!isRoomPage && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={
            <>
              <Home />
              <Footer />
            </>
          } />
          <Route path="/join" element={
            <>
              <Join />
              <Footer />
            </>
          } />
          <Route path="/room/:id" element={<Room />} />
          <Route path="/pricing" element={
            <>
              <Pricing />
              <Footer />
            </>
          } />
          <Route path="/settings" element={
            <>
              <Settings />
              <Footer />
            </>
          } />
          <Route path="/profile" element={
            <>
              <Profile />
              <Footer />
            </>
          } />
          <Route path="/auth" element={
            <>
              <Auth />
              <Footer />
            </>
          } />
          <Route path="/contact" element={
            <>
              <Contact />
              <Footer />
            </>
          } />
        </Routes>
      </main>
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