import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ComingSoon.css';

const ComingSoon = () => {
  const { toolId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [tool, setTool] = useState(location.state?.tool || null);
  const [loading, setLoading] = useState(!location.state?.tool);
  const [error, setError] = useState(null);
  const [emailNotified, setEmailNotified] = useState(false);
  const [browserNotified, setBrowserNotified] = useState(false);

  const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

  useEffect(() => {
    if (!tool && toolId) {
      fetchToolDetails();
    }
  }, [toolId, tool]);

  const fetchToolDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tools/${toolId}`);
      if (response.data.success) {
        setTool(response.data.tool);
      } else {
        setError('Tool not found');
      }
    } catch (error) {
      console.error('Error fetching tool details:', error);
      setError('Failed to load tool details');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailNotification = () => {
    setEmailNotified(true);
    // Simulate API call
    setTimeout(() => {
      // Could reset after some time if needed
    }, 3000);
  };

  const handleBrowserNotification = () => {
    setBrowserNotified(true);
    // Simulate API call
    setTimeout(() => {
      // Could reset after some time if needed
    }, 3000);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToTools = () => {
    navigate('/tools');
  };

  if (loading) {
    return (
      <div className="coming-soon-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tool details...</p>
        </div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="coming-soon-page">
        <div className="error-container">
          <h2>❌ {error || 'Tool not found'}</h2>
          <p>The tool you're looking for doesn't exist or couldn't be loaded.</p>
          <div className="action-buttons">
            <button onClick={handleGoBack} className="back-button">
              ← Go Back
            </button>
            <button onClick={handleGoToTools} className="tools-button">
              View All Tools
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="coming-soon-page">
      <div className="coming-soon-container">
        <div className="tool-header">
          <div className="tool-icon-large">
            <span className="icon">{tool.icon}</span>
            <div className="coming-soon-badge-large">
              <span>Coming Soon</span>
            </div>
          </div>
          
          <div className="tool-info">
            <h1 className="tool-title">{tool.title}</h1>
            <p className="tool-description">{tool.description}</p>
            
            <div className="tool-meta">
              <div className="meta-item">
                <span className="meta-label">Status:</span>
                <span className="meta-value coming-soon">🚀 Coming Soon</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Progress:</span>
                <span className="meta-value">{tool.progress || '0%'} Complete</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Expected Release:</span>
                <span className="meta-value">{tool.eta || 'TBD'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="progress-section">
          <h3>Development Progress</h3>
          <div className="progress-container">
            <div className="progress-bar-large">
              <div 
                className="progress-fill-large" 
                style={{ width: tool.progress || '0%' }}
              ></div>
            </div>
            <span className="progress-text-large">{tool.progress || '0%'} Complete</span>
          </div>
        </div>

        {tool.features && tool.features.length > 0 && (
          <div className="features-section">
            <h3>Planned Features</h3>
            <div className="features-grid">
              {tool.features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">✨</div>
                  <div className="feature-content">
                    <h4>{feature}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="info-section">
          <h3>About This Tool</h3>
          <div className="info-content">
            <p>
              We're working hard to bring you this amazing tool! Our development team is 
              currently focused on creating the best possible experience for you.
            </p>
            <p>
              This tool will be completely free to use and will integrate seamlessly with 
              our existing platform. Stay tuned for updates!
            </p>
          </div>
        </div>

        <div className="action-section">
          <h3>Stay Updated</h3>
          <div className="update-options">
            <div className="update-option">
              <span className="option-icon">📧</span>
              <div className="option-content">
                <h4>Email Notifications</h4>
                <p>Get notified when this tool is ready</p>
              </div>
              <button 
                className={`notify-button ${emailNotified ? 'success' : ''}`}
                onClick={handleEmailNotification}
                disabled={emailNotified}
              >
                {emailNotified ? '✅ Notified' : 'Notify Me'}
              </button>
            </div>
            
            <div className="update-option">
              <span className="option-icon">🔔</span>
              <div className="option-content">
                <h4>Browser Notifications</h4>
                <p>Receive browser notifications</p>
              </div>
              <button 
                className={`notify-button ${browserNotified ? 'success' : ''}`}
                onClick={handleBrowserNotification}
                disabled={browserNotified}
              >
                {browserNotified ? '✅ Enabled' : 'Enable'}
              </button>
            </div>
          </div>
        </div>

        <div className="navigation-section">
          <button onClick={handleGoBack} className="back-button-large">
            ← Back to Tools
          </button>
          <button onClick={handleGoToTools} className="explore-button">
            Explore Available Tools →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon; 