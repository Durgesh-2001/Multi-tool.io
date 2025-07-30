import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { assets } from '../../assets/assets';
import PaymentModal from '../PaymentModal/PaymentModal';
import Login from '../../pages/Login/Login';
import './Navbar.css';

// Define the API base URL using the environment variable
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showValidityModal, setShowValidityModal] = useState(false);
  const [cancelMsg, setCancelMsg] = useState('');
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // Move fetchUserStatus here so it's accessible everywhere in Navbar
  const fetchUserStatus = async (token) => {
    try {
      // CORRECTED: Use the API_BASE_URL constant
      const response = await fetch(`${API_BASE_URL}/payment/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
        setIsProUser(data.isPro);
        setSubscriptionEnd(data.subscriptionEnd);
      } else {
        console.error('Failed to fetch user status:', response.status, response.statusText);
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
    // Immediately update the state with data from the payment success call
    if (data) {
      setIsProUser(data.isPro);
      setCredits(data.credits);
      setSubscriptionEnd(data.subscriptionEnd);
    } else {
      // Fallback to fetching status if no data is provided
      const token = localStorage.getItem('token');
      if (token) {
        fetchUserStatus(token);
      }
    }
  };

  const handleCancelSubscription = async () => {
    setCancelMsg('');
    const token = localStorage.getItem('token');
    try {
      // CORRECTED: Use the API_BASE_URL constant
      const res = await fetch(`${API_BASE_URL}/payment/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Cancel failed');
      const data = await res.json();
      setIsProUser(false);
      setSubscriptionEnd(null);
      setCredits(3);
      setCancelMsg(data.message || 'Subscription cancelled successfully.');
      window.dispatchEvent(new Event('authChange'));
    } catch (err) {
      setCancelMsg('Failed to cancel subscription. Please try again.');
    }
  };

  if (loading) {
    return (
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
        <ul className="navbar-links">
          <li><Link to="/" onClick={scrollToTop}>Home</Link></li>
          <li><Link to="/tools">Tools</Link></li>
          <li><Link to="/pricing">Pricing</Link></li>
          <li><ThemeToggle /></li>
        </ul>
      </nav>
    );
  }

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
        <ul className="navbar-links">
          <li><Link to="/" onClick={scrollToTop}>Home</Link></li>
          <li><Link to="/tools">Tools</Link></li>
          <li><Link to="/pricing">Pricing</Link></li>
          <li><ThemeToggle /></li>
          {user ? (
            <>
              <li className="wallet-balance" onClick={() => setShowValidityModal(true)}>
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
              <li className="user-greeting">
                <span>Hi, {user.name}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><button className="login-modal-btn" onClick={() => setIsLoginModalOpen(true)}>Login</button></li>
            </>
          )}
        </ul>
      </nav>
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
      {isLoginModalOpen && (
        <div className="login-modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
          <div className="login-modal-content" onClick={e => e.stopPropagation()}>
            <button className="login-modal-close" onClick={() => setIsLoginModalOpen(false)}>×</button>
            <Login setShowLogin={setIsLoginModalOpen} />
          </div>
        </div>
      )}
      {showValidityModal && (
        <div className="modal-overlay-new open" onClick={() => setShowValidityModal(false)}>
          <div
            className={`modal-content-new${isDarkMode ? ' dark' : ''}`}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 400,
              textAlign: 'center',
              background: isDarkMode ? '#23272f' : '#fff',
              color: isDarkMode ? '#fff' : '#222',
              border: isDarkMode ? '1.5px solid #333' : '1.5px solid #e5e7eb',
              boxShadow: isDarkMode ? '0 2px 8px 0 rgba(0,0,0,0.18)' : '0 2px 8px 0 rgba(0,0,0,0.04)',
            }}
          >
            <h2>Subscription Validity</h2>
            {isProUser && subscriptionEnd ? (
              <>
                <p style={{ fontSize: '1.1rem', margin: '1.5rem 0' }}>Your Pro subscription is active until:</p>
                <div style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '1.5rem' }}>{new Date(subscriptionEnd).toLocaleDateString()}</div>
                <button className="plan-btn-new" style={{ background: '#ef4444', color: '#fff', width: 220, margin: '0 auto' }} onClick={handleCancelSubscription}>Cancel Subscription</button>
                {cancelMsg && <div style={{ marginTop: 10, color: cancelMsg.includes('success') ? '#16a34a' : '#ef4444' }}>{cancelMsg}</div>}
              </>
            ) : (
              <p style={{ fontSize: '1.1rem', margin: '2rem 0' }}>You are currently on the Free plan.<br />Points: {credits}</p>
            )}
            <button className="plan-btn-new" onClick={() => setShowValidityModal(false)} style={{ width: '100%' }}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
