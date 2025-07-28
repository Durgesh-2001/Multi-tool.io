import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext';
import './Footer.css'
import { assets } from '../../assets/assets'
import { useState } from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      // Reset the message after 3 seconds
      setTimeout(() => setSubscribed(false), 3000);
    }
  }

  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
          <div className="footer-logo" onClick={scrollToTop}>
            <img 
              src={isDarkMode ? assets.logo_dark : assets.logo} 
              alt="Logo" 
              className="footer-logo-img"
            />
            <div className="footer-logo-text" onClick={scrollToTop}>
              <span className="logo-text">mulitool.io</span>
            </div>
          </div>
          <div className="made-in-india">
            <span className="made-in-india-text">Made in India</span>
            <span className="india-flag-svg-container">
              <svg className="india-flag-svg" viewBox="0 0 60 36" width="36" height="22" xmlns="http://www.w3.org/2000/svg">
                <rect width="60" height="12" y="0" fill="#FF9933"/>
                <rect width="60" height="12" y="12" fill="#fff"/>
                <rect width="60" height="12" y="24" fill="#138808"/>
                <circle cx="30" cy="18" r="5.2" fill="#054187"/>
                <g>
                  {[...Array(24)].map((_, i) => (
                    <line
                      key={i}
                      x1="30"
                      y1="18"
                      x2={30 + 5.2 * Math.cos((i * 15 * Math.PI) / 180)}
                      y2={18 + 5.2 * Math.sin((i * 15 * Math.PI) / 180)}
                      stroke="#fff"
                      strokeWidth="0.7"
                    />
                  ))}
                </g>
                <circle cx="30" cy="18" r="1.1" fill="#054187"/>
              </svg>
            </span>
          </div>
          <p>© {currentYear} All rights reserved</p>
          <div className="footer-trendy-lines">
            <p>🚀 From concept to deployment in record time</p>
          </div>
        </div>

        <div className="footer-content-center">
          <div className="connect-section">
            <h3>Connect</h3>
            <div className="footer-social-icons">
              <a href="https://www.instagram.com/durgesh_dxj" target="_blank" rel="noopener noreferrer">
                <img src={assets.instagram_icon} alt="Instagram" />
              </a>
              <a href="https://x.com/Durgesh_offl" target="_blank" rel="noopener noreferrer">
                <img src={assets.twitter_icon} alt="Twitter" />
              </a>
              <a href="https://www.linkedin.com/in/durgeshjay" target="_blank" rel="noopener noreferrer">
                <img src={assets.linkedin_icon} alt="LinkedIn" />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-content-right">
          <h2>Get in touch</h2>
          <ul>
            <li>Bengaluru,Karnataka</li>
            <li>Phone:7975956486</li>
            <li>Email:dj26112001@gmail.com</li>
          </ul>

          <div className="footer-subscribe">
            <form onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit">Subscribe</button>
            </form>
            {subscribed && (
              <p className="subscribe-message">🎉 Thanks for subscribing! Stay tuned for updates!</p>
            )}
          </div>
        </div>
      </div>
      <hr />
      <p className='footer-text'>Made with 🧠 & ❤ by <span className="footer-name">Durgesh</span></p>
    </div>
  )
}

export default Footer