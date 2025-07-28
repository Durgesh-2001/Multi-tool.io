import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ToolCard.css';

const ToolCard = ({ tool, onClick }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (tool.available) {
      // For available tools, use the existing onClick
      if (onClick) {
        onClick();
      }
    } else if (tool.maintenance) {
      // For maintenance tools, show maintenance message
      alert(tool.maintenanceMessage || 'This tool is currently under maintenance. Please check back later.');
    } else {
      // For coming soon tools, navigate to the coming soon page
      navigate(`/coming-soon/${tool.id}`, { 
        state: { tool } 
      });
    }
  };

  const getStatusClass = () => {
    if (tool.available) return 'available';
    if (tool.maintenance) return 'maintenance';
    return 'coming-soon';
  };

  const getStatusText = () => {
    if (tool.available) return '✅ Available';
    if (tool.maintenance) return '🔧 Under Maintenance';
    return '🚀 Coming Soon';
  };

  return (
    <div 
      className={`tool-card ${getStatusClass()}`}
      onClick={handleCardClick}
    >
      <div className="tool-icon">
        <span className="icon">{tool.icon}</span>
        {!tool.available && !tool.maintenance && (
          <div className="coming-soon-badge">
            <span>Coming Soon</span>
          </div>
        )}
        {tool.maintenance && (
          <div className="maintenance-badge">
            <span>Maintenance</span>
          </div>
        )}
      </div>
      
      <div className="tool-content">
        <h3 className="tool-title">{tool.title}</h3>
        <p className="tool-description">{tool.description}</p>
        
        {tool.available ? (
          <div className="tool-status available">
            <span>{getStatusText()}</span>
          </div>
        ) : tool.maintenance ? (
          <div className="tool-status maintenance">
            <span>{getStatusText()}</span>
            <p className="maintenance-message">{tool.maintenanceMessage}</p>
          </div>
        ) : (
          <div className="tool-status coming-soon">
            <span>{getStatusText()}</span>
            <div className="progress-info">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: tool.progress || '0%' }}
                ></div>
              </div>
              <span className="progress-text">{tool.progress} Complete</span>
            </div>
            <span className="eta">ETA: {tool.eta}</span>
          </div>
        )}
      </div>
      
      <div className="tool-arrow">
        <span>→</span>
      </div>
    </div>
  );
};

export default ToolCard; 