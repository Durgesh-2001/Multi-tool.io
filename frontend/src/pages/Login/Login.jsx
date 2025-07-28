import React, { useState, useEffect } from 'react';
import './Login.css';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

const Login = ({ setShowLogin, defaultMode }) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [currState, setCurrState] = useState({
    name: '',
    email: '',
    password: '',
    mobile: ''
  });
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setFormVisible(true), 50);
  }, []);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setCurrState(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // Email/Password Login/Register
  const onSubmit = async (e) => {
    e.preventDefault();
    if ((!isLogin && !currState.name) || !currState.email || !currState.password) {
      setError('Please fill all required fields');
      return;
    }
    // Registration: Validate Indian mobile number
    if (!isLogin && currState.mobile) {
      const indianMobileRegex = /^[6-9]\d{9}$/;
      if (!indianMobileRegex.test(currState.mobile)) {
        setError('Please enter a valid 10-digit Indian mobile number (starts with 6-9)');
        return;
      }
    }
    try {
      const BASE_URL = import.meta.env.VITE_BACKEND_URL;
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(`${BASE_URL}${endpoint}`, currState);
      if (response.data.success) {
        if (isLogin) {
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            window.dispatchEvent(new Event('authChange'));
            setCurrState({ name: '', email: '', password: '', mobile: '' });
            setTimeout(() => {
              setShowLogin && setShowLogin(false);
              navigate('/');
            }, 1000);
          } else {
            setError('Authentication failed - No token received');
          }
        } else {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            setIsLogin(true);
            setCurrState({ name: '', email: '', password: '', mobile: '' });
            navigate('/login');
          }, 1500);
        }
      } else {
        setError(response.data.message || 'An error occurred');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during authentication');
    }
  };

  // Send OTP for mobile login
  const sendOTPHandler = async () => {
    if (!currState.mobile || currState.mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    try {
      setError('');
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/otp/send`, { mobile: currState.mobile });
      if (res.data.success) {
        setOtpSent(true);
      } else {
        setError(res.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  // Verify OTP for mobile login
  const verifyOTPHandler = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    try {
      setError('');
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/otp/verify`, { mobile: currState.mobile, otp });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user || { name: 'User' }));
        window.dispatchEvent(new Event('authChange'));
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setShowLogin && setShowLogin(false);
          navigate('/');
        }, 1000);
      } else {
        setError(res.data.message || 'OTP verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  // Google login handler
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/google`, { credential: credentialResponse.credential });
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.dispatchEvent(new Event('authChange'));
        setCurrState({ name: '', email: '', password: '', mobile: '' });
        setShowLogin && setShowLogin(false);
        navigate('/');
      } else {
        setError('Google authentication failed.');
      }
    } catch (err) {
      setError('Google login failed.');
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-form ${isDarkMode ? 'dark' : 'light'}${formVisible ? ' show' : ''}`}> 
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        {error && <div className="error-message">{error}</div>}
        {showSuccess && <div className="success-message">Success!</div>}
        {isLogin && (
          <div className="login-method-toggle">
            <button className={!isPhoneLogin ? 'active' : ''} onClick={() => { setIsPhoneLogin(false); setError(''); }}>
              Email Login
            </button>
            <button className={isPhoneLogin ? 'active' : ''} onClick={() => { setIsPhoneLogin(true); setError(''); }}>
              Phone Login
            </button>
          </div>
        )}
        {isLogin && isPhoneLogin ? (
          <form onSubmit={verifyOTPHandler} className="login-inputs">
            <div className="form-group">
              <label htmlFor="login-mobile">Mobile Number</label>
              <input
                id="login-mobile"
                type="tel"
                name="mobile"
                placeholder="Enter your mobile number"
                value={currState.mobile}
                onChange={onChangeHandler}
                maxLength="10"
                disabled={otpSent}
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit mobile number"
                required
              />
              {!otpSent && (
                <button type="button" className="send-otp-button" onClick={sendOTPHandler}>
                  Send OTP
                </button>
              )}
            </div>
            {otpSent && (
              <div className="form-group">
                <label htmlFor="login-otp">OTP</label>
                <input
                  id="login-otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={e => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 6) setOtp(value);
                  }}
                  pattern="[0-9]{6}"
                  maxLength="6"
                  required
                />
                <button type="button" className="resend-otp-button" onClick={sendOTPHandler}>
                  Resend
                </button>
              </div>
            )}
            {otpSent && (
              <button type="submit" className="auth-btn">
                Verify & Login
              </button>
            )}
          </form>
        ) : (
          <form onSubmit={onSubmit} className="login-inputs">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="register-name">Name</label>
                <input
                  id="register-name"
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={currState.name}
                  onChange={onChangeHandler}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="Email"
                value={currState.email}
                onChange={onChangeHandler}
                required
              />
            </div>
            <div className="form-group password-group">
              <label htmlFor="login-password">Password</label>
              <div className="password-field">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={currState.password}
                  onChange={onChangeHandler}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="register-mobile">Mobile</label>
                <input
                  id="register-mobile"
                  type="tel"
                  name="mobile"
                  placeholder="Mobile"
                  value={currState.mobile}
                  onChange={onChangeHandler}
                  maxLength="10"
                  pattern="[6-9]{1}[0-9]{9}"
                  title="Please enter a valid 10-digit Indian mobile number (starts with 6-9)"
                  required
                />
              </div>
            )}
            <button type="submit" className="auth-btn">
              {isLogin ? 'Login' : 'Register'}
            </button>
            <div className="divider"></div>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError('Google login failed.')}
              width="100%"
              text={isLogin ? 'signin_with' : 'signup_with'}
            />
            <p className="toggle-auth">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span
                onClick={() => {
                  setIsLogin(!isLogin);
                  setCurrState({ name: '', email: '', password: '', mobile: '' });
                  setError('');
                  setOtpSent(false);
                  setOtp('');
                }}
              >
                {isLogin ? 'Register' : 'Login'}
              </span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
