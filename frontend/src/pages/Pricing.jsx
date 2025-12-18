import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import { motion } from 'framer-motion';

const PLANS = [
  { id: 'free', name: 'Free', price: 0, features: ['Basic access to tools', '3 trials', 'Community support'] },
  { id: 'micro', name: 'Micro', price: 1, period: '1 minute', features: ['TEST PLAN ONLY', 'Expires in 60 seconds', 'For testing expiration'], test: true },
  { id: 'weekly', name: 'Weekly', price: 9, original: 15, period: '7 days', features: ['Full tool access', 'Unlimited generations', 'Standard speed'] },
  { id: 'super', name: 'Super', price: 39, original: 59, period: '1 month', features: ['Unlimited generations', 'Priority processing','HD quality'], popular: true },
  { id: 'pro', name: 'Pro', price: 69, original: 99, period: '6 months', features: ['Unlimited generations', 'Fast & HD quality', 'Priority queue & Beta access'] },
  { id: 'proplus', name: 'Pro+', price: 99, original: 149, period: '1 year', features: ['Everything in Pro', 'Dedicated support', 'Private roadmap calls'], popular: true }
];

const Pricing = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelect = (plan) => {
    if (plan.id === 'free') {
      navigate('/');
      return;
    }
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setModalOpen(false);
    window.dispatchEvent(new Event('authChange'));
  };

  return (
    <main className="pricing" aria-labelledby="pricing-heading" aria-describedby="pricing-subheading">
      <section className="pricing__hero">
        <h1 id="pricing-heading" className="pricing__title"><br></br>Pricing Plans That Scale With You</h1>
        <br></br><p id="pricing-subheading" className="pricing__subtitle">
          Whether you're exploring or building at scale — choose a plan that matches your workflow.
          Upgrade, downgrade, or cancel anytime.
        </p>
      </section>

      <section className="pricing__grid" aria-label="Available subscription plans">
        {PLANS.map((plan, idx) => (
          <motion.article
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={`pricing__card ${plan.popular ? 'pricing__card--popular' : ''} ${plan.test ? 'pricing__card--test' : ''}`}
            tabIndex={0}
            aria-labelledby={`plan-${plan.id}-name`}
            aria-describedby={`plan-${plan.id}-features plan-${plan.id}-price`}
          >
            {plan.popular && (
              <span className="pricing__badge" aria-label="Most popular plan">Most Popular</span>
            )}
            {plan.test && (
              <span className="pricing__badge pricing__badge--test" aria-label="Test plan">TEST PLAN</span>
            )}
            <header>
              <h2 id={`plan-${plan.id}-name`} className="pricing__plan-name">{plan.name}</h2>
              <p className="pricing__plan-period">{plan.period}</p>
            </header>
            <div id={`plan-${plan.id}-price`} className="pricing__price-block" aria-label={`Price ${plan.price} rupees`}>
              <span className="pricing__price">₹{plan.price}</span>
              {plan.original && <span className="pricing__price-original">₹{plan.original}</span>}
            </div>
            <ul id={`plan-${plan.id}-features`} className="pricing__features">
              {plan.features.map((feature, index) => (
                <li key={index} className="pricing__feature">
                  <svg className="pricing__feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelect(plan)}
              className={`pricing__cta ${plan.id === 'free' ? 'pricing__cta--outline' : ''}`}
              aria-label={plan.id === 'free' ? 'Get started with free plan' : `Choose ${plan.name} plan`}
            >
              {plan.id === 'free' ? 'Get Started' : 'Choose Plan'}
            </button>
          </motion.article>
        ))}
      </section>
      <PaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedPlan={selectedPlan}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </main>
  );
};

export default Pricing;