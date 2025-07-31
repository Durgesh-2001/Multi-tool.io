import React, { useEffect, useState } from 'react';
import './Profile.css';
import { useTheme } from '../../context/ThemeContext';

const Profile = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [cancelMsg, setCancelMsg] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const token = localStorage.getItem('token');
  const { isDarkMode } = useTheme();

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setUser({});
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Fetch user info with subscription details
        const userRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!userRes.ok) throw new Error('Failed to fetch user profile');
        const userData = await userRes.json();
        
        if (!userData.success) {
          throw new Error(userData.message || 'Failed to fetch user data');
        }

        // Get the actual user data from the response
        const userInfo = userData.user;
        
        // Set user data with proper subscription status
        setUser({
          ...userInfo,
          subscriptionPlan: userInfo.subscriptionPlan || 'FREE',
          credits: userInfo.credits || 0,
          isProUser: userInfo.isProUser || false,
          subscriptionEndDate: userInfo.subscriptionEndDate ? new Date(userInfo.subscriptionEndDate) : null
        });
      } catch (err) {
        setUser({});
        setError(err.message);
      }
      setLoading(false);
    };
    fetchData();
  }, [token, API_BASE_URL]);

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    setCancelMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/payment/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      
      if (res.ok) {
        // Update user state with the response data or fallback to defaults
        setUser(prev => ({
          ...prev,
          isProUser: false,
          subscriptionPlan: 'FREE',
          credits: data.credits || 150,
          subscriptionEndDate: null
        }));
        setCancelMsg('Your subscription has been cancelled successfully. Your account has been reverted to FREE plan.');
        // Dispatch auth change to update UI everywhere
        window.dispatchEvent(new Event('authChange'));
      } else {
        setCancelMsg(data.message || 'Failed to cancel subscription. Please contact support if this persists.');
      }
    } catch (err) {
      console.error('Subscription cancellation error:', err);
      setCancelMsg('An error occurred while cancelling your subscription. Please try again or contact support.');
    } finally {
      setCancelLoading(false);
      // Only hide the warning if cancellation was successful
      if (!error) {
        setTimeout(() => setShowCancelWarning(false), 2000);
      }
    }
  };

  if (loading) return <div className={`loading ${isDarkMode ? 'dark' : 'light'}`}>Loading...</div>;
  if (error) return <div className={`loading ${isDarkMode ? 'dark' : 'light'}`}>Error: {error}</div>;

  return (
    <div className={`profileContainer ${isDarkMode ? 'dark' : 'light'}`}>
      <h2 className={`heading ${isDarkMode ? 'dark' : 'light'}`}>Profile</h2>
      <div className="cardsWrapper">
        <div className={`card ${isDarkMode ? 'dark' : 'light'}`}>
          <h3 className={`cardTitle ${isDarkMode ? 'dark' : 'light'}`}>Basic Info</h3>
          <table className={`infoTable ${isDarkMode ? 'dark' : 'light'}`}>
            <tbody>
              <tr>
                <td className={`label ${isDarkMode ? 'dark' : 'light'}`}>Name:</td>
                <td className={`value ${isDarkMode ? 'dark' : 'light'}`}>{user.name}</td>
              </tr>
              <tr>
                <td className={`label ${isDarkMode ? 'dark' : 'light'}`}>Mobile:</td>
                <td className={`value ${isDarkMode ? 'dark' : 'light'}`}>{user.mobile || 'N/A'}</td>
              </tr>
              <tr>
                <td className={`label ${isDarkMode ? 'dark' : 'light'}`}>Email:</td>
                <td className={`value ${isDarkMode ? 'dark' : 'light'}`}>{user.email}</td>
              </tr>
              <tr>
                <td className={`label ${isDarkMode ? 'dark' : 'light'}`}>Plan:</td>
                <td className={`value ${isDarkMode ? 'dark' : 'light'}`}>
                  <span style={{ 
                    color: user.subscriptionPlan !== 'FREE' ? '#16a34a' : '#71717a',
                    fontWeight: 'bold'
                  }}>
                    {user.subscriptionPlan || 'FREE'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className={`label ${isDarkMode ? 'dark' : 'light'}`}>Credits:</td>
                <td className={`value ${isDarkMode ? 'dark' : 'light'}`}>
                  {user.subscriptionPlan !== 'FREE' ? '∞ Unlimited' : user.credits}
                </td>
              </tr>
              <tr>
                <td className={`label ${isDarkMode ? 'dark' : 'light'}`}>Status:</td>
                <td className={`value ${isDarkMode ? 'dark' : 'light'}`}>
                  <span style={{ 
                    color: user.subscriptionPlan !== 'FREE' ? '#16a34a' : '#71717a',
                    fontWeight: 'bold'
                  }}>
                    {user.subscriptionPlan !== 'FREE' ? 'ACTIVE' : 'FREE'}
                  </span>
                </td>
              </tr>
              {user.isProUser && user.subscriptionEndDate && (
                <tr>
                  <td className={`label ${isDarkMode ? 'dark' : 'light'}`}>Valid Until:</td>
                  <td className={`value ${isDarkMode ? 'dark' : 'light'}`}>
                    {new Date(user.subscriptionEndDate).toLocaleDateString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {user.subscriptionPlan !== 'FREE' && (
            <div style={{ marginTop: 24 }}>
              <button
                className="plan-btn-new"
                style={{ 
                  background: '#ef4444', 
                  color: '#fff', 
                  width: '100%',
                  opacity: cancelLoading ? 0.7 : 1,
                  cursor: cancelLoading ? 'not-allowed' : 'pointer'
                }}
                onClick={() => setShowCancelWarning(true)}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Processing...' : 'Cancel Subscription'}
              </button>
            </div>
          )}
          {/* Confirmation modal */}
          {showCancelWarning && (
            <div style={{
              marginTop: 16,
              padding: 16,
              background: isDarkMode ? '#2f333b' : '#fffbe6',
              color: isDarkMode ? '#fff' : '#b45309',
              borderRadius: 8,
              border: `1px solid ${isDarkMode ? '#ef4444' : '#fbbf24'}`
            }}>
              <strong>Warning:</strong> Are you sure you want to cancel your Pro subscription? You’ll lose all features immediately.
              <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                <button
                  className="plan-btn-new"
                  style={{ background: '#ef4444', color: '#fff', flex: 1 }}
                  onClick={handleCancelSubscription}
                  disabled={cancelLoading}
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
                <button
                  className="plan-btn-new"
                  style={{ background: '#e5e7eb', color: '#222', flex: 1 }}
                  onClick={() => setShowCancelWarning(false)}
                  disabled={cancelLoading}
                >
                  Keep Subscription
                </button>
              </div>
            </div>
          )}
          {/* Show cancellation message */}
          {cancelMsg && (
            <div style={{
              marginTop: 12,
              color: cancelMsg.includes('success') ? '#16a34a' : '#ef4444'
            }}>
              {cancelMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
