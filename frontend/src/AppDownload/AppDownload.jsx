import React from 'react'
import './AppDownload.css'
import { assets } from '../../assets/assets'

const AppDownload = () => {
  return (
    <div className='app-download' id='app-download'>
      <h2>🚀 Get Our Mobile App</h2>
      <p>Experience <b>multi-tool.io</b> on the go with our powerful mobile app. Convert files, generate images, and access all tools anywhere, anytime.</p>
      <div className='app-download-platforms'>
        <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
          <img src={assets.play_store} alt="Get it on Google Play" />
        </a>
        <a href="https://www.apple.com/app-store" target="_blank" rel="noopener noreferrer">
          <img src={assets.app_store} alt="Download on App Store" />
        </a>
      </div>
      <div className="app-features">
        <div className="feature-item">
          <span className="feature-icon">⚡</span>
          <span>Lightning Fast</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🔒</span>
          <span>Secure & Private</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">📱</span>
          <span>Offline Support</span>
        </div>
      </div>
    </div>
  )
}

export default AppDownload