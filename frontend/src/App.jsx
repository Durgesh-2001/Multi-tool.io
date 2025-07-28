import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Tools from './pages/Tools/Tools';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import ComingSoon from './pages/ComingSoon/ComingSoon';
import Pricing from './pages/Pricing/Pricing';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <Router>
          <div className="App">
            <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Login defaultMode="register" />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/coming-soon/:toolId" element={<ComingSoon />} />
              <Route path="/pricing" element={<Pricing />} />
            </Routes>
          </div>
          <Footer />
        </div>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
