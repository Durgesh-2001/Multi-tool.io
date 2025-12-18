import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import QRCode from 'react-qr-code';
import testCardImg from '../assets/test_card.png';
import cardBackImg from '../assets/card_back.png';

const PaymentModal = ({ isOpen, onClose, onPaymentSuccess, selectedPlan }) => {
  const [loading, setLoading] = useState(false);
  const [showUpi, setShowUpi] = useState(true); // default to UPI
  const [upiCountdown, setUpiCountdown] = useState(60);
  const [showCard, setShowCard] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setShowUpi(true);
      setShowCard(false);
      setUpiCountdown(60);
    }
  }, [isOpen, selectedPlan]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (showUpi && isOpen) {
      setUpiCountdown(60);
      interval = setInterval(() => {
        setUpiCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showUpi, isOpen, selectedPlan]);

  useEffect(() => {
    let interval;
    if (showUpi && isOpen) {
      interval = setInterval(async () => {
        try {
          if (localStorage.getItem('upiPaid') === 'true') {
            await handleConfirmUpiPayment();
            clearInterval(interval);
          }
        } catch (err) {}
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [showUpi, selectedPlan?.name, isOpen]);

  if (!isOpen || !selectedPlan) return null;

  const handleClose = () => {
    onClose();
  };

  const handlePayWithCard = () => {
    setShowUpi(false);
    setShowCard(true);
  };

  const handleCardPayNow = () => {
    setLoading(true);
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      // Require exact user data (no fallbacks). Abort if missing.
      if (!user || !user.name || !user.email || !user.mobile) {
        alert('Missing profile details (name, email, mobile). Please update your profile before proceeding with payment.');
        setLoading(false);
        return;
      }

      const prefillData = {
        name: user.name,
        email: user.email,
        contact: String(user.mobile)
      };

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: selectedPlan.price * 100,
        currency: 'INR',
        name: 'Multi-Tool.io',
        description: `Purchase - ${selectedPlan.name}`,
        handler: async function () {
          const token = localStorage.getItem('token');
          try {
            const promoteResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment/promote`, {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ plan: selectedPlan.name })
            });
            if (!promoteResponse.ok) throw new Error('Promotion failed on the backend.');
            const data = await promoteResponse.json();
            alert('Payment Successful! You are now a Pro user.');
            onPaymentSuccess && onPaymentSuccess(data);
            handleClose();
          } catch (err) {
            alert('Payment was successful, but there was an issue upgrading your account. Please refresh.');
            setLoading(false);
          }
        },
        prefill: prefillData,
        theme: { color: '#16a34a' },
        modal: { ondismiss: () => setLoading(false) }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert('Could not open payment window. Is VITE_RAZORPAY_KEY_ID set?');
      setLoading(false);
    }
  };

  const handlePayWithUpi = () => {
    setShowUpi(true);
    setShowCard(false);
  };

  const handleConfirmUpiPayment = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const promoteResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment/promote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: selectedPlan.name })
      });
      if (!promoteResponse.ok) throw new Error('Activation failed on the backend.');
      const data = await promoteResponse.json();
      alert('UPI Payment Confirmed! You are now a Pro user.');
      onPaymentSuccess && onPaymentSuccess(data);
      handleClose();
    } catch (err) {
      alert('There was an issue activating your account. Please try again.');
      setLoading(false);
    }
  };
  const upiNote = encodeURIComponent(`Multi-Tool.io | Plan: ${selectedPlan.name}`);
  const qrValue = `upi://pay?pa=durgesh007@slc&pn=Multi-Tool.io&am=${selectedPlan.price}&cu=INR&tn=${upiNote}`;

  const FlipCard = () => {
    const [flipped, setFlipped] = useState(false);
    const toggle = () => setFlipped((f) => !f);
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    };

    return (
      <div className="pay-modal__card-container">
        <div
          className={`pay-modal__card${flipped ? ' pay-modal__card--flipped' : ''}`}
          onClick={toggle}
          onKeyDown={onKey}
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          aria-label={flipped ? 'Show front of card' : 'Show back of card'}
        >
          <img
            src={testCardImg}
            alt="Test Card Front"
            className="pay-modal__card-face pay-modal__card-face--front"
          />
          <img
            src={cardBackImg}
            alt="Test Card Back"
            className="pay-modal__card-face pay-modal__card-face--back"
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`pay-modal ${isOpen ? 'pay-modal--open' : ''}`} onClick={handleClose}>
      <div className="pay-modal__dialog" onClick={e => e.stopPropagation()}>
        <header className="pay-modal__header"><h2 className="pay-modal__title">Complete Payment for {selectedPlan.name}</h2></header>
        <p className="pay-modal__amount">₹{selectedPlan.price}</p>
        <div className="pay-modal__methods">
          <button className={`pay-modal__tab ${showUpi ? 'pay-modal__tab--inactive' : ''}`} onClick={handlePayWithCard} disabled={loading}>Card</button>
          <button className={`pay-modal__tab ${showUpi ? '' : 'pay-modal__tab--inactive'}`} onClick={handlePayWithUpi} disabled={loading}>UPI</button>
        </div>
        {showUpi && (
          <div className="pay-modal__qr">
            <div className="pay-modal__qr-wrap"><QRCode value={qrValue} size={200} /></div>
            <p className="pay-modal__qr-text">Scan to pay ₹{selectedPlan.price}.<br />{upiCountdown > 0 ? `Wait ${upiCountdown}s after payment...` : 'Click below to activate:'}</p>
            {upiCountdown === 0 && (
              <button className="pay-modal__tab" onClick={handleConfirmUpiPayment} disabled={loading}>Activate Now</button>
            )}
          </div>
        )}
        {showCard && !showUpi && (
          <div className="pay-modal__flip">
            <FlipCard />
            <button className="pay-modal__tab" onClick={handleCardPayNow} disabled={loading}>Pay Now</button>
          </div>
        )}
        <button className="pay-modal__close" onClick={handleClose}>X</button>
      </div>
    </div>
  );
};

export default PaymentModal;