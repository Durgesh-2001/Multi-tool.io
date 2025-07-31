import React, { useEffect, useState, useCallback } from 'react';
import './Profile.css';
import { useTheme } from '../../context/ThemeContext';

// --- Sub-components for better structure ---

const InfoRow = ({ label, value, className = '' }) => (
  <tr>
    <td className="label">{label}:</td>
    <td className={`value ${className}`}>{value}</td>
  </tr>
);

// --- FIX: Corrected the logic for displaying credits ---
const CreditsDisplay = ({ plan, credits }) => {
  // The logic now explicitly checks if the plan is NOT one of the Pro plans.
  // This is more robust than checking for just "FREE".
  const isPro = ['Weekly', 'Super', 'Pro', 'Pro+'].includes(plan);

  if (isPro) {
    return <span className="status-badge unlimited">∞ Unlimited</span>;
  }
  
  // For any other case (including "Free"), display the actual credit amount.
  return <span className={credits <= 0 ? 'credits-zero' : ''}>{credits}</span>;
};


const SubscriptionStatus = ({ plan }) => (
  <span className={`status-badge ${plan !== 'FREE' ? 'active' : 'free'}`}>
    {plan !== 'FREE' ? 'ACTIVE' : 'FREE'}
  </span>
);

const CancelSubscription = ({ onCancel, loading, isDarkMode }) => {
  const [showWarning, setShowWarning] = useState(false);

  if (!showWarning) {
    return (
      <button className="cancel-btn" onClick={() => setShowWarning(true)} disabled={loading}>
        Cancel Subscription
      </button>
    );
  }

  return (
    <div className={`cancel-warning-box ${isDarkMode ? 'dark' : 'light'}`}>
      <strong>Warning:</strong> Are you sure you want to cancel? You will lose all Pro features immediately.
      <div className="warning-actions">
        <button className="confirm-btn" onClick={onCancel} disabled={loading}>
          {loading ? 'Cancelling...' : 'Confirm Cancel'}
        </button>
        <button className="keep-btn" onClick={() => setShowWarning(false)} disabled={loading}>
          Keep Subscription
        </button>
      </div>
    </div>
  );
};


// --- Main Profile Component ---

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelMsg, setCancelMsg] = useState({ text: '', type: '' });
  const [cancelLoading, setCancelLoading] = useState(false);

  const { isDarkMode } = useTheme();
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      setError('You are not logged in.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch user profile');
      }

      setUser({
        ...data.user,
        subscriptionPlan: data.user.subscriptionPlan || 'FREE',
        isProUser: data.user.isProUser || false,
        subscriptionEndDate: data.user.subscriptionEndDate ? new Date(data.user.subscriptionEndDate) : null
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    setCancelMsg({ text: '', type: '' });
    const token = localStorage.getItem('token');

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
        setCancelMsg({ text: 'Subscription cancelled successfully.', type: 'success' });
        await fetchData(); 
      } else {
        throw new Error(data.message || 'Failed to cancel subscription.');
      }
    } catch (err) {
      setCancelMsg({ text: err.message, type: 'error' });
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading) return <div className={`loading ${isDarkMode ? 'dark' : 'light'}`}>Loading Profile...</div>;
  if (error) return <div className={`loading error ${isDarkMode ? 'dark' : 'light'}`}>{error}</div>;
  if (!user) return <div className={`loading ${isDarkMode ? 'dark' : 'light'}`}>Please log in to view your profile.</div>;

  return (
    <div className={`profile-container ${isDarkMode ? 'dark' : ''}`}>
      <h2 className="profile-heading">Profile</h2>
      <div className="cards-wrapper">
        <div className={`profile-card ${isDarkMode ? 'dark' : ''}`}>
          <h3 className="card-title">Account Details</h3>
          <table className="info-table">
            <tbody>
              <InfoRow label="Name" value={user.name || 'N/A'} />
              <InfoRow label="Email" value={user.email || 'N/A'} />
              <InfoRow label="Mobile" value={user.mobile || 'N/A'} />
              <InfoRow label="Plan Name" value={user.subscriptionPlan} />
              <InfoRow label="Status" value={<SubscriptionStatus plan={user.subscriptionPlan} />} />
              <InfoRow label="Credits" value={<CreditsDisplay plan={user.subscriptionPlan} credits={user.credits} />} />
              {user.isProUser && user.subscriptionEndDate && (
                <InfoRow label="Valid Until" value={user.subscriptionEndDate.toLocaleDateString()} />
              )}
            </tbody>
          </table>
          
          {user.isProUser && (
            <div className="card-footer">
              <CancelSubscription onCancel={handleCancelSubscription} loading={cancelLoading} isDarkMode={isDarkMode} />
            </div>
          )}
          
          {cancelMsg.text && (
            <div className={`status-message ${cancelMsg.type}`}>
              {cancelMsg.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
