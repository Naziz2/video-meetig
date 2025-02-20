import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
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
    </Router>
  );
}