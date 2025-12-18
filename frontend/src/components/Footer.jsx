import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext';
import { assets } from '../assets/assets'
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
    <footer className='site-footer' id='footer'>
      <div className="site-footer__inner">
        <div className="site-footer__col">
          <div className="site-footer__logo" onClick={scrollToTop}>
            <img
              src={isDarkMode ? assets.logo_dark : assets.logo}
              alt="Logo"
              className="site-footer__logo-img"
            />
            <div className="site-footer__brand" onClick={scrollToTop}>
              <span className="site-footer__brand-name">Multi-tool.io</span>
            </div>
          </div>
          
          <p className="site-footer__text">© {currentYear} All rights reserved</p>
          <div className="site-footer__quote"><p>🚀 From concept to deployment in record time</p></div>
        </div>

        <div className="site-footer__col site-footer__connect">
          <div className="site-footer__connect-inner">
            <h3 className="site-footer__connect-title">Connect</h3>
            <div className="site-footer__social">
              <a href="https://www.instagram.com/durgesh_dxj" target="_blank" rel="noopener noreferrer">
                <img className="site-footer__social-img" src={assets.instagram_icon} alt="Instagram" />
              </a>
              <a href="https://x.com/Durgesh_offl" target="_blank" rel="noopener noreferrer">
                <img className="site-footer__social-img" src={assets.twitter_icon} alt="Twitter" />
              </a>
              <a href="https://www.linkedin.com/in/durgeshjay" target="_blank" rel="noopener noreferrer">
                <img className="site-footer__social-img" src={assets.linkedin_icon} alt="LinkedIn" />
              </a>
            </div>
          </div>
        </div>
        <div className="site-footer__col">
          <h2 className="site-footer__heading">Get in touch</h2>
          <ul className="site-footer__list">
            <li className="site-footer__list-item">Bengaluru, Karnataka</li>
            <li className="site-footer__list-item">Phone: 7975956486</li>
            <li className="site-footer__list-item">Email: dj26112001@gmail.com</li>
          </ul>
          <div className="site-footer__subscribe">
            <form className="site-footer__subscribe-form" onSubmit={handleSubscribe}>
              <input
                className="site-footer__subscribe-input"
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="site-footer__subscribe-btn" type="submit">Subscribe</button>
            </form>
            {subscribed && (
              <p className="site-footer__subscribe-msg">🎉 Thanks for subscribing! Stay tuned for updates!</p>
            )}
          </div>
        </div>
      </div>
      <hr className="site-footer__hr" />
      <p className='site-footer__copyright'>Made with 🧠 & ❤ by <span className="site-footer__author">Durgesh</span></p>
    </footer>
  )
}

export default Footer