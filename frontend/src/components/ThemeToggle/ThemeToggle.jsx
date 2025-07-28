import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { assets } from '../../assets/assets';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-toggle-btn" 
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <img 
        src={isDarkMode ? assets.sun_icon : assets.moon_icon} 
        alt={isDarkMode ? 'Sun' : 'Moon'}
        className="theme-icon"
      />
    </button>
  );
};

export default ThemeToggle; 