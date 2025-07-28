import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const [code, setCode] = useState('');
  const [mobile, setMobile] = useState('');
  const [resetMethod, setResetMethod] = useState('email'); // 'email' or 'sms'

  useEffect(() => {
    // Check URL params for token or code
    const urlToken = searchParams.get('token');
    const urlCode = searchParams.get('code');
    const urlMobile = searchParams.get('mobile');
    
    if (urlToken) {
      setToken(urlToken);
      setResetMethod('email');
    } else if (urlCode && urlMobile) {
      setCode(urlCode);
      setMobile(urlMobile);
      setResetMethod('sms');
    }
  }, [searchParams]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      let res;
      
      if (resetMethod === 'email' && token) {
        // Email reset with token
        res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reset`, {
          token: token,
          password: form.password
        });
      } else if (resetMethod === 'sms' && code && mobile) {
        // SMS reset with code
        res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/reset`, {
          code: code,
          mobile: mobile,
          password: form.password
        });
      } else {
        setError('Invalid reset method or missing parameters');
        setLoading(false);
        return;
      }

      if (res.data.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const identifier = resetMethod === 'email' ? form.email : form.mobile;
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/forgot`, {
        identifier: identifier,
        method: resetMethod
      });

      setSuccess(res.data.message);
      
      // For development, show the code if it's SMS
      if (resetMethod === 'sms' && res.data.code) {
        setSuccess(`${res.data.message} Code: ${res.data.code}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset request');
    } finally {
      setLoading(false);
    }
  };

  // If we have token or code from URL, show password reset form
  if (token || (code && mobile)) {
    return (
      <div className="reset-page">
        <div className="reset-form">
          <h2>Reset Your Password</h2>
          <p className="reset-info">
            {resetMethod === 'email' 
              ? 'Enter your new password below.' 
              : 'Enter your new password below.'
            }
          </p>
          
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              name="password"
              placeholder="New Password"
              value={form.password}
              onChange={handleChange}
              required
              minLength="6"
            />
            <input
              type="password"
              name="confirm"
              placeholder="Confirm New Password"
              value={form.confirm}
              onChange={handleChange}
              required
              minLength="6"
            />
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <button type="submit" className="reset-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          
          <p className="back-link">
            <a href="/login">Back to Login</a>
          </p>
        </div>
      </div>
    );
  }

  // Manual reset form (when no token/code in URL)
  return (
    <div className="reset-page">
      <div className="reset-form">
        <h2>Reset Your Password</h2>
        <p className="reset-info">Choose how you'd like to reset your password:</p>
        
        <div className="reset-method-tabs">
          <button 
            className={`tab ${resetMethod === 'email' ? 'active' : ''}`}
            onClick={() => setResetMethod('email')}
          >
            Email
          </button>
          <button 
            className={`tab ${resetMethod === 'sms' ? 'active' : ''}`}
            onClick={() => setResetMethod('sms')}
          >
            SMS
          </button>
        </div>

        <form onSubmit={handleManualReset}>
          {resetMethod === 'email' ? (
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email || ''}
              onChange={handleChange}
              required
            />
          ) : (
            <input
              type="tel"
              name="mobile"
              placeholder="Enter your mobile number"
              value={form.mobile || ''}
              onChange={handleChange}
              required
            />
          )}
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <button type="submit" className="reset-btn" disabled={loading}>
            {loading ? 'Sending...' : `Send Reset ${resetMethod === 'email' ? 'Link' : 'Code'}`}
          </button>
        </form>
        
        <p className="back-link">
          <a href="/login">Back to Login</a>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword; 