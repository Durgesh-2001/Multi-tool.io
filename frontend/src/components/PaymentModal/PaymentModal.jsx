import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './PaymentModal.css';
import QRCode from 'react-qr-code';
import testCardImg from '../../assets/test_card.png';
import cardBackImg from '../../assets/card_back.png';

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
      
      // Prepare prefill data with fallbacks
      const prefillData = {
        name: user?.name || 'User',
        email: user?.email || 'user@gmail.com',
        contact: user?.mobile || '9999999999'
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

  const qrValue = `upi://pay?pa=dj26112001@okhdfcbank&pn=Multi-Tool.io&am=${selectedPlan.price}&cu=INR`;

  // Card flip component
  const FlipCard = () => {
    const [flipped, setFlipped] = useState(false);
    return (
      <div
        className="flip-card-container"
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        onClick={() => setFlipped(f => !f)}
        style={{ margin: '0 auto 1rem auto', width: 320, height: 200 }}
      >
        <div className={`flip-card${flipped ? ' flipped' : ''}`}>
          <div className="flip-card-front">
            <img src={testCardImg} alt="Test Card Front" style={{ width: '100%', height: '100%', borderRadius: 18, boxShadow: '0 4px 24px rgba(22,163,74,0.18)' }} />
          </div>
          <div className="flip-card-back">
            <img src={cardBackImg} alt="Test Card Back" style={{ width: '100%', height: '100%', borderRadius: 18, boxShadow: '0 4px 24px rgba(22,163,74,0.18)' }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="modal-overlay-new open" onClick={handleClose}>
      <div className={`modal-content-new ${isDarkMode ? 'dark' : 'light'}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Complete Payment for {selectedPlan.name}</h2>
        </div>
        <p className="payment-amount">Total: ₹{selectedPlan.price}</p>
        <div className="payment-method-selector">
          <button className={`payment-btn-new${!showUpi ? '' : ' secondary'}`} onClick={handlePayWithCard} disabled={loading}>Pay with Card</button>
          <button className={`payment-btn-new${showUpi ? '' : ' secondary'}`} onClick={handlePayWithUpi} disabled={loading}>Pay with UPI</button>
        </div>
        {showUpi && (
          <div className="qr-payment-new" style={{ marginTop: '2rem', padding: '1.5rem 0', background: isDarkMode ? '#23272f' : '#f4f8fa', borderRadius: '1rem', boxShadow: '0 2px 12px rgba(22,163,74,0.07)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <QRCode value={qrValue} size={200} />
            </div>
            <p style={{ marginTop: '1.2rem', fontSize: '1.1rem', color: isDarkMode ? '#fff' : '#222', textAlign: 'center' }}>
              Scan the QR code above with your UPI app and complete the payment of ₹{selectedPlan.price}.
              <br/>
              {upiCountdown > 0
                ? `Once paid, wait ${upiCountdown}s to activate...`
                : 'Once paid, click below to activate:'}
            </p>
            {upiCountdown === 0 && (
              <button className="payment-btn-new" onClick={handleConfirmUpiPayment} disabled={loading} style={{ marginTop: '1.2rem' }}>I've Paid with UPI, Activate Now</button>
            )}
          </div>
        )}
        {showCard && !showUpi && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <FlipCard />
            <button
              className="payment-btn-new"
              style={{ marginTop: '1.2rem' }}
              onClick={handleCardPayNow}
              disabled={loading}
            >Pay Now</button>
          </div>
        )}
        <button className="close-button-new" onClick={handleClose}>X</button>
      </div>
    </div>
  );
};

export default PaymentModal;