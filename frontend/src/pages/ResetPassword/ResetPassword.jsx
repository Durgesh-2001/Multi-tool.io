import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import './ResetPassword.css';

const ResetPassword = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [step, setStep] = useState('request');
  const [token, setToken] = useState('');

  // This effect runs when the component loads to check for a reset token in the URL.
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setStep('reset');
    }
  }, [searchParams]);

  // Debugging log: Shows the current value of the previewUrl state on each render.
  console.log('--- Current previewUrl state ---', previewUrl);

  // --- Step 1: Request a password reset link ---
  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setPreviewUrl(''); // Reset on new request

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot`,
        { email: email }
      );

      // Debugging log: Shows the full response data received from the backend.
      console.log('--- Received response from backend ---', response.data);

      // Capture both the message and the previewUrl from the response
      setSuccess(response.data.message);
      if (response.data.previewUrl) {
        setPreviewUrl(response.data.previewUrl);
      }
      setStep('confirm'); // Move to confirmation view
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to send reset link. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2: Set the new password using the token ---
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/reset`,
        {
          token: token,
          password: password,
        }
      );

      if (response.data.success) {
        setSuccess('Password has been reset successfully! Redirecting...');
        // Redirect to login page after 3 seconds for a better user experience.
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Invalid or expired token. Please request a new link.'
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Render Functions for Forms ---

  const renderRequestForm = () => (
    <form onSubmit={handleRequestReset}>
      <p>Enter your email address.</p>
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="reset-btn" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>
  );

  const renderResetForm = () => (
    <form onSubmit={handleSetNewPassword}>
      <p>Please enter your new password.</p>
      <input
        type="password"
        name="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        minLength="6"
        required
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />
      <button type="submit" className="reset-btn" disabled={loading}>
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );

  return (
    <div className={`reset-page ${isDarkMode ? 'dark' : 'light'}`}>
      <div className={`reset-form ${isDarkMode ? 'dark' : 'light'}`}>
        <h2>Reset Password</h2>

        {step === 'request' && renderRequestForm()}
        {step === 'reset' && renderResetForm()}

        {error && <div className="error-message">{error}</div>}

        {success && (
          <div className="success-message">
            {success}
            {previewUrl && (
              <div className="preview-link">
                (For testing) Link:{' '}
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Ethereal Email
                </a>
              </div>
            )}
          </div>
        )}

        <p className="back-link">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;