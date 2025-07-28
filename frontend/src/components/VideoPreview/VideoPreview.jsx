import React, { useState, useRef, useEffect } from 'react';
import { assets } from '../../assets/assets';
import './VideoPreview.css';

const VideoPreview = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    // Start playing when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        // console.log('Autoplay prevented:', err);
        setIsPlaying(false);
      });
    }
  }, []);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoEnd = () => {
    // Restart video when it ends
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  return (
    <div className="video-preview-section">
      <div className="video-container">
        <div className="video-header">
          <h2>🎬 See It In Action</h2>
        </div>
        
        <div className="video-wrapper">
          <video
            ref={videoRef}
            className="preview-video"
            poster="/video-poster.jpg"
            onEnded={handleVideoEnd}
            muted={isMuted}
            loop
            playsInline
            autoPlay
          >
            <source src={assets.preview_video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          <div className="video-controls">
            <button 
              className="control-btn play-pause-btn"
              onClick={handlePlayPause}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            <button 
              className="control-btn mute-btn"
              onClick={handleMuteToggle}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>
        
        <div className="video-features">
          <div className="feature-highlight">
            <span className="feature-icon">⚡</span>
            <span>Lightning Fast Conversion</span>
          </div>
          <div className="feature-highlight">
            <span className="feature-icon">🎯</span>
            <span>Intuitive Interface</span>
          </div>
          <div className="feature-highlight">
            <span className="feature-icon">🛡️</span>
            <span>Secure Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPreview; 