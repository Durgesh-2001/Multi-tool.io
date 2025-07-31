import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // **1. Import ReactDOM for Portals**
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { assets } from '../../assets/assets';
import PaymentModal from '../PaymentModal/PaymentModal';
import Login from '../../pages/Login/Login';
import './Navbar.css';

const COST_PER_GENERATION = 50; // Sync with backend

const LoginModal = ({ isOpen, onClose, onLoginComplete }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="login-modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={e => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose}>×</button>
        <Login onLoginComplete={onLoginComplete} />
      </div>
    </div>,
    document.body
  );
};


const Navbar = () => {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [notification, setNotification] = useState({ message: '', type: '' });

  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const fetchUserStatus = async (token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
        setIsProUser(data.isPro);
        setSubscriptionEnd(data.subscriptionEnd);
      }
    } catch (error) {
      console.error('Failed to fetch user status', error);
    }
  };

  useEffect(() => {
    const checkUserAuth = () => {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('user');
      
      if (token && userInfo) {
        setUser(JSON.parse(userInfo));
        fetchUserStatus(token);
      } else {
        setUser(null);
        setCredits(0);
        setIsProUser(false);
      }
      setLoading(false);
    };

    checkUserAuth();

    const handleAuthChange = () => checkUserAuth();
    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 3000);
  };

  const handleLoginComplete = (data) => {
    if (data.success) {
      showNotification(data.message, 'success');
      setTimeout(() => {
        setIsLoginModalOpen(false);
        window.dispatchEvent(new Event('authChange'));
      }, 1500);
    } else {
      showNotification(data.message, 'error');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const handlePaymentSuccess = (data) => {
    if (data) {
      setIsProUser(data.isPro);
      setCredits(data.credits);
      setSubscriptionEnd(data.subscriptionEnd);
    } else {
      const token = localStorage.getItem('token');
      if (token) {
        fetchUserStatus(token);
      }
    }
  };
  
  const handleConversionSuccess = () => {
    if (user && !isProUser) {
      setCredits(prev => Math.max(0, prev - COST_PER_GENERATION));
    }
  };

  // The loading state is simplified as the main nav now renders immediately
  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo" onClick={scrollToTop}>
          <img 
            src={isDarkMode ? assets.logo_dark : assets.logo} 
            alt="Logo" 
            className="navbar-logo-img"
          />
          <div className="navbar-logo-text">
            <span className="logo-text">mulitool.io</span>
          </div>
        </div>

        <div className="navbar-center">
          <ul className="navbar-links">
            <li><Link to="/" onClick={scrollToTop}>Home</Link></li>
            {user && (
              <li className="wallet-balance">
                <img src={assets.wallet} alt="Wallet" className="wallet-icon" />
                {isProUser ? (
                  <div className="pro-label">
                    <span>PRO</span>
                    <span className="infinity">∞</span>
                  </div>
                ) : (
                  <span>{credits} Points</span>
                )}
              </li>
            )}
            {user && (
              <li className="user-greeting">
                <span>Hi, {user.name}</span>
              </li>
            )}
            <li><ThemeToggle /></li>
          </ul>
        </div>

        <div className="navbar-right">
            <div className="hamburger-menu">
                <button
                    className={`hamburger-btn${menuOpen ? ' open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Menu"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>
            </div>
        </div>
        
        <div className={`dropdown-menu-container ${menuOpen ? 'open' : ''}`}>
            <div className="dropdown-menu">
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</Link>
              {user ? (
                <button className="logout-btn" onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</button>
              ) : (
                <button className="login-modal-btn" onClick={() => { setIsLoginModalOpen(true); setMenuOpen(false); }}>Login</button>
              )}
            </div>
        </div>
      </nav>

      {/* **3. Render the new Portal component here** */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginComplete={handleLoginComplete}
      />

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default Navbar;
