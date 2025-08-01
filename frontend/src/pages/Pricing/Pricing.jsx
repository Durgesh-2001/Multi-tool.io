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

  const handlePlanSelect = (plan) => {
    // If the user clicks on the "Free" plan, navigate them to the homepage.
    if (plan.name === 'Free') {
      navigate('/');
      return; // Stop further execution
    }
    // For any other plan, open the payment modal.
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    // On successful payment, close the modal and trigger a global state update.
    setModalOpen(false);
    window.dispatchEvent(new Event('authChange'));
  };

  return (
    <div className={`pricing-page${isDarkMode ? ' dark' : ''}`} style={{ minHeight: '100vh', background: isDarkMode ? '#18181b' : '#f6f6f7', padding: '3rem 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1rem' }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: 32, background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>{'< Back'}</button>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2.5rem', textAlign: 'center', color: isDarkMode ? '#fff' : '#111827' }}>Choose Your Plan</h1>
        
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