import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import './PaymentModal.css';
import QRCode from 'react-qr-code';
import testCardImg from '../../assets/test_card.png';
import cardBackImg from '../../assets/card_back.png';

// CORRECTED: Define the API base URL for all backend calls
const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const PaymentModal = ({ isOpen, onClose, onPaymentSuccess, selectedPlan }) => {
  const [loading, setLoading] = useState(false);
  const [showUpi, setShowUpi] = useState(true);
  const [upiCountdown, setUpiCountdown] = useState(60);
  const [showCard, setShowCard] = useState(false);
  const { isDarkMode } = useTheme();

  // Load Razorpay script when the component mounts
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Reset state when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setShowUpi(true);
      setShowCard(false);
      setUpiCountdown(60);
    }
  }, [isOpen, selectedPlan]);

  // Countdown timer for UPI payments
  useEffect(() => {
    let interval;
    if (showUpi && isOpen) {
      setUpiCountdown(60); // Reset countdown
      interval = setInterval(() => {
        setUpiCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showUpi, isOpen]);

  // This effect for auto-confirming UPI is complex and can be unreliable.
  // It's kept here but be aware of its potential for issues.
  useEffect(() => {
    let interval;
    if (showUpi && isOpen && localStorage.getItem('upiPaid') === 'true') {
        handleConfirmUpiPayment();
    }
    return () => clearInterval(interval);
  }, [showUpi, isOpen]);


  if (!isOpen || !selectedPlan) return null;

  const handleClose = () => {
    if (loading) return; // Prevent closing while a process is running
    onClose();
  };

  const handlePayWithCard = () => {
    setShowUpi(false);
    setShowCard(true);
  };

  const handlePayWithUpi = () => {
    setShowUpi(true);
    setShowCard(false);
  };
  
  // NEW: Updated function to fetch user data and open Razorpay
  const handleCardPayNow = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      // Step 1: Fetch user details from the backend
      const userDetailsResponse = await fetch(`${API_BASE_URL}/user/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!userDetailsResponse.ok) {
        throw new Error('Could not fetch user details. Please try again.');
      }
      const userDetails = await userDetailsResponse.json();

      // Step 2: Configure Razorpay with the fetched user details
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: selectedPlan.price * 100,
        currency: 'INR',
        name: 'Multi-Tool.io',
        description: `Purchase - ${selectedPlan.name} Plan`,
        handler: async function (response) {
          // This handler is called after a successful payment by the user
          try {
            // Step 3: Call your backend to confirm the payment and upgrade the user
            const promoteResponse = await fetch(`${API_BASE_URL}/payment/promote`, {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                  plan: selectedPlan.name,
                  // Sending payment IDs to backend is good practice for verification
                  razorpay_payment_id: response.razorpay_payment_id 
              })
            });

            if (!promoteResponse.ok) {
              throw new Error('Promotion failed on the backend.');
            }
            
            const data = await promoteResponse.json();
            alert('Payment Successful! Your account has been upgraded.');
            onPaymentSuccess?.(data); // Safely call the success handler
            handleClose();

          } catch (err) {
            alert('Payment was successful, but there was an issue upgrading your account. Please contact support.');
            setLoading(false);
          }
        },
        // UPDATED: Use dynamic data from the API call
        prefill: {
          name: userDetails.name || 'Valued User',
          email: userDetails.email || '',
          contact: userDetails.contact || ''
        },
        theme: { color: '#16a34a' },
        modal: { 
            ondismiss: () => {
                setLoading(false); // Re-enable button if user closes the modal
                console.log('Razorpay modal dismissed');
            }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      alert(error.message || 'Could not initiate payment. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const handleConfirmUpiPayment = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // CORRECTED: Use the full, absolute URL
      const promoteResponse = await fetch(`${API_BASE_URL}/payment/promote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ plan: selectedPlan.name })
      });

      if (!promoteResponse.ok) throw new Error('Activation failed on the backend.');
      
      const data = await promoteResponse.json();
      localStorage.removeItem('upiPaid'); // Clean up local storage flag
      alert('UPI Payment Confirmed! Your account has been upgraded.');
      onPaymentSuccess?.(data);
      handleClose();

    } catch (err) {
      alert('There was an issue activating your account. Please try again or contact support.');
      setLoading(false);
    }
  };

  const qrValue = `upi://pay?pa=dj26112001@okhdfcbank&pn=Multi-Tool.io&am=${selectedPlan.price}&cu=INR&tn=Payment for ${selectedPlan.name}`;

  const FlipCard = () => {
    const [flipped, setFlipped] = useState(false);
    return (
      <div className="flip-card-container" 
           onMouseEnter={() => setFlipped(true)} 
           onMouseLeave={() => setFlipped(false)} 
           onClick={() => setFlipped(f => !f)} 
           style={{ margin: '0 auto 1rem auto', width: 320, height: 200 }}>
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
          <div className="qr-payment-new">
            <QRCode value={qrValue} size={200} />
            <p className="upi-instructions">
              Scan the QR code with your UPI app to pay ₹{selectedPlan.price}.
              <br/>
              {upiCountdown > 0
                ? `Once paid, we'll try to auto-detect in ${upiCountdown}s...`
                : 'If auto-detection fails, click below:'}
            </p>
            {upiCountdown === 0 && (
              <button className="payment-btn-new" onClick={handleConfirmUpiPayment} disabled={loading}>I've Paid with UPI</button>
            )}
          </div>
        )}
        {showCard && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <FlipCard />
            <button className="payment-btn-new" onClick={handleCardPayNow} disabled={loading}>
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        )}
        <button className="close-button-new" onClick={handleClose} disabled={loading}>X</button>
      </div>
    </div>
  );
};

export default PaymentModal;