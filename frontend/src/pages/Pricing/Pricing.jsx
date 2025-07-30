import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import './Pricing.css'
import PaymentModal from '../../components/PaymentModal/PaymentModal';

// Define the API base URL using the environment variable
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const plans = [
  { name: 'Free', price: 0, features: ['Basic access to tools', '3 trials'] },
  { name: 'Weekly', price: 9, original: 15, features: ['7 days full access', 'Unlimited generations'] },
  { name: 'Super', price: 39, original: 59, features: ['1 month full access', 'Unlimited generations', 'Faster Outputs'], popular: true },
  { name: 'Pro', price: 69, original: 99, features: ['6 months full access', 'Unlimited generations', 'Fast and HD quality outputs'] },
  { name: 'Pro+', price: 99, original: 149, features: ['1 year full access', 'Everything in Pro', 'Early access features', 'Dedicated support'] },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { isDarkMode } = useTheme();
  const [isProUser, setIsProUser] = useState(false);
  const [subscriptionEnd, setSubscriptionEnd] = useState(null);
  const [cancelMsg, setCancelMsg] = useState('');

  useEffect(() => {
    // Fetch user subscription status on mount
    const token = localStorage.getItem('token');
    if (token) {
      // CORRECTED: Use the API_BASE_URL constant
      fetch(`${API_BASE_URL}/payment/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
            if (!res.ok) {
                // If response is not ok, log the error and return null
                console.error('Failed to fetch user status:', res.status, res.statusText);
                return null;
            }
            return res.json();
        })
        .then(data => {
          if (data) {
            setIsProUser(data.isPro);
            setSubscriptionEnd(data.subscriptionEnd);
          }
        })
        .catch(err => {
            // Catch network errors or JSON parsing errors
            console.error('Error fetching user status:', err);
        });
    }
  }, [modalOpen]);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const handlePaymentSuccess = (data) => {
    setModalOpen(false);
    if (data && data.isPro !== undefined) {
      setIsProUser(data.isPro);
      setSubscriptionEnd(data.subscriptionEnd);
    }
    window.dispatchEvent(new Event('authChange'));
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
      setCancelMsg(data.message || 'Subscription cancelled successfully.');
      window.dispatchEvent(new Event('authChange'));
    } catch (err) {
      setCancelMsg('Failed to cancel subscription. Please try again.');
    }
  };

  return (
    <div className={`pricing-page${isDarkMode ? ' dark' : ''}`} style={{ minHeight: '100vh', background: isDarkMode ? '#18181b' : '#f6f6f7', padding: '3rem 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1rem' }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: 32, background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>{'< Back'}</button>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2.5rem', textAlign: 'center', color: isDarkMode ? '#fff' : '#111827' }}>Choose Your Plan</h1>
        {/* You may want to add back the UI for subscription status and cancellation here */}
        {cancelMsg && <p style={{ textAlign: 'center', color: 'green', marginBottom: '1rem' }}>{cancelMsg}</p>}
        {isProUser && subscriptionEnd && (
            <div style={{ textAlign: 'center', marginBottom: '2rem', color: isDarkMode ? '#ccc' : '#555' }}>
                <p>Your subscription is active until: {new Date(subscriptionEnd).toLocaleDateString()}</p>
                <button onClick={handleCancelSubscription} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px' }}>
                    Cancel Subscription
                </button>
            </div>
        )}
        <div className="plans-view">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`plan-card-new${plan.popular ? ' highlight' : ''}${isDarkMode ? ' dark' : ''}`}
              style={{
                background: isDarkMode ? '#23272f' : '#fff',
                color: isDarkMode ? '#fff' : '#222',
                borderColor: isDarkMode ? '#333' : plan.popular ? '#16a34a' : '#e5e7eb',
                boxShadow: isDarkMode ? '0 2px 8px 0 rgba(0,0,0,0.18)' : '0 2px 8px 0 rgba(0,0,0,0.04)',
              }}
            >
              {plan.popular && <div className="tag">Most Popular</div>}
              <h3>{plan.name}</h3>
              <p className="price-new">
                ₹{plan.price}
                {plan.original && <span className="slashed-price-animated">₹{plan.original}</span>}
              </p>
              <hr />
              <ul className="features-new">
                {plan.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
              <button
                className="plan-btn-new"
                onClick={() => handlePlanSelect(plan)}
                style={{ background: plan.popular ? '#16a34a' : isDarkMode ? '#fff' : '#111', color: plan.popular ? '#fff' : isDarkMode ? '#18181b' : '#fff' }}
              >
                {plan.name === 'Free' ? 'Get started' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
      <PaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedPlan={selectedPlan}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Pricing;