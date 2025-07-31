import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ImageGenerator.css';
import PaymentModal from '../PaymentModal/PaymentModal';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOption, setSelectedOption] = useState('placeholder');
  const [availableOptions, setAvailableOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [showFreeTools, setShowFreeTools] = useState(false);
  const [freeTools, setFreeTools] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

  const samplePrompts = [
    'A serene mountain landscape at sunset with golden clouds',
    'A futuristic city with flying cars and neon lights',
    'A cute robot playing with a cat in a garden',
    'A magical forest with glowing mushrooms and fairy lights',
    'A steampunk airship flying over Victorian London',
    'A peaceful beach scene with palm trees and crystal clear water'
  ];

  // Fetch available options on component mount
  useEffect(() => {
    fetchAvailableOptions();
    fetchFreeTools();
  }, []);

  const fetchAvailableOptions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/imagegen/options`);
      if (response.data.success) {
        setAvailableOptions(response.data.options);
        // Set placeholder as default
        setSelectedOption('placeholder');
      }
    } catch (error) {
      console.error('Failed to fetch options:', error);
      // Fallback to default options
      setAvailableOptions([
        {
          id: 'placeholder',
          name: 'Placeholder Generator',
          description: 'Generate placeholder images for testing',
          type: 'placeholder',
          requiresSetup: false,
          isFree: true
        },
        {
          id: 'local',
          name: 'Local Stable Diffusion',
          description: 'Run AI locally on your computer (requires setup)',
          type: 'local',
          requiresSetup: true,
          isFree: true
        },
        {
          id: 'free-api',
          name: 'Free API Services',
          description: 'Use various free image generation APIs',
          type: 'api',
          requiresSetup: false,
          isFree: true
        }
      ]);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const fetchFreeTools = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/imagegen/free-tools`);
      if (response.data.success) {
        setFreeTools(response.data.tools);
      }
    } catch (error) {
      console.error('Failed to fetch free tools:', error);
    }
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
    setError('');
    setSuccess('');
  };

  const handleSamplePrompt = (samplePrompt) => {
    setPrompt(samplePrompt);
    setError('');
    setSuccess('');
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt to generate an image');
      return;
    }

    if (prompt.length < 10) {
      setError('Please provide a more detailed description (at least 10 characters)');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');
    setGeneratedImage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to use this feature');
      }

      // First, try to deduct credits
      try {
        const deductResponse = await fetch(`${API_BASE_URL}/tools/deduct-credits`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!deductResponse.ok) {
          const errorData = await deductResponse.json();
          if (deductResponse.status === 403) {
            setIsPaymentModalOpen(true);
          }
          throw new Error(errorData.message || 'Failed to process credits');
        }

        // Trigger UI update for credits
        window.dispatchEvent(new Event('authChange'));
      } catch (deductError) {
        throw new Error(deductError.message || 'Failed to process credits. Please try again.');
      }

      const response = await axios.post(`${API_BASE_URL}/imagegen/generate`, {
        prompt: prompt.trim(),
        option: selectedOption
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 30000 // 30 seconds timeout
      });

      if (response.data.success) {
        setGeneratedImage(response.data.imageUrl);
        setSuccess(response.data.message);
        if (response.data.note) {
          setSuccess(prev => prev + ' ' + response.data.note);
        }
        window.dispatchEvent(new Event('authChange'));
      } else {
        setError(response.data.error || 'Failed to generate image');
      }
    } catch (err) {
      let errorMessage = 'Failed to generate image';
      if (err.response) {
        if (err.response.status === 402) {
          setIsPaymentModalOpen(true);
          errorMessage = 'You have insufficient credits or your free quota is over. Please upgrade your plan to continue.';
        } else if (err.response.data) {
          const errorData = err.response.data;
          errorMessage = errorData.error || errorData.message || errorMessage;
        }
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The image generation is taking longer than expected.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    handleGenerate(); // Retry generation after successful payment
  };

  const downloadImage = () => {
    if (!generatedImage) return;

    try {
      const link = document.createElement('a');
      link.href = `${import.meta.env.VITE_BACKEND_URL}${generatedImage}`;
      link.download = `free_generated_${Date.now()}.svg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download image. Please try right-clicking on the image and selecting "Save image as".');
    }
  };

  const clearAll = () => {
    setPrompt('');
    setGeneratedImage(null);
    setError('');
    setSuccess('');
  };

  return (
    <div className="image-generator">
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
      {error && (
        <div style={{ background: '#ffeaea', color: '#b91c1c', padding: '1rem', borderRadius: 8, marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>
          {error}
        </div>
      )}
      <div className="generator-container">
        <h2 className="generator-title">🎨 Free AI Image Generator</h2>
        <p className="generator-subtitle">
          Create images from your imagination using completely free options! 
          No API tokens or payments required. Multiple free alternatives available.
        </p>

        <div className="free-badge">
          <span>🆓 100% FREE - Multiple Options Available</span>
        </div>

        <div className="input-section">
          <div className="prompt-input">
            <label htmlFor="prompt">Describe the image you want to generate:</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Enter a detailed description of the image you want to create... (e.g., 'A majestic dragon flying over a medieval castle at sunset with golden clouds')"
              disabled={isGenerating}
              rows="4"
            />
          </div>

          <div className="option-selector">
            <label htmlFor="option">Free Generation Option:</label>
            {isLoadingOptions ? (
              <div className="loading-options">Loading free options...</div>
            ) : (
              <select
                id="option"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                disabled={isGenerating}
              >
                {availableOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    🆓 {option.name} - {option.description}
                    {option.requiresSetup && ' (Setup Required)'}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="sample-prompts">
            <h4>💡 Sample Prompts:</h4>
            <div className="prompt-grid">
              {samplePrompts.map((samplePrompt, index) => (
                <button
                  key={index}
                  className="sample-prompt"
                  onClick={() => handleSamplePrompt(samplePrompt)}
                  disabled={isGenerating}
                >
                  {samplePrompt}
                </button>
              ))}
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="generate-button"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : '✨ Generate Image'}
            </button>
            <button
              className="clear-button"
              onClick={clearAll}
              disabled={isGenerating}
            >
              Clear
            </button>
          </div>
        </div>

        {isGenerating && (
          <div className="generating-section">
            <div className="loading-spinner"></div>
            <p>Creating your masterpiece with free tools...</p>
            <p className="generating-tip">This may take a few seconds. Using free services!</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            ✅ {success}
          </div>
        )}

        {generatedImage && (
          <div className="result-section">
            <h3>Generated Image (Free Service):</h3>
            <div className="image-container">
              <img 
                src={`${import.meta.env.VITE_BACKEND_URL}${generatedImage}`}
                alt="Free Generated"
                className="generated-image"
                onError={() => setError('Failed to load generated image. Please try regenerating.')}
              />
            </div>
            <div className="image-actions">
              <button className="download-button" onClick={downloadImage}>
                💾 Download Free Image
              </button>
              <button className="regenerate-button" onClick={handleGenerate}>
                🔄 Regenerate
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="generator-info">
        <h3>🎨 Free AI Image Generator Features</h3>
        <ul>
          <li>Generate images from text descriptions</li>
          <li>Multiple free generation options</li>
          <li>Placeholder images for testing</li>
          <li>Local Stable Diffusion setup guide</li>
          <li>Free online tools recommendations</li>
          <li>Download generated images</li>
          <li>🆓 Completely free - no API tokens or payments</li>
        </ul>
        
        <div className="tips-section">
          <h4>💡 Tips for better results:</h4>
          <ul>
            <li>Be specific and detailed in your descriptions</li>
            <li>Include style keywords (realistic, artistic, cartoon, etc.)</li>
            <li>Mention lighting, colors, and mood</li>
            <li>Specify camera angles and composition</li>
            <li>Use descriptive adjectives and vivid language</li>
            <li>Try different free options for varied results</li>
            <li>Consider setting up local Stable Diffusion for best results</li>
          </ul>
        </div>

        <div className="free-info">
          <h4>🆓 Free Options Available:</h4>
          <ul>
            <li><strong>Placeholder Generator</strong> - Always works, generates test images</li>
            <li><strong>Local Stable Diffusion</strong> - Best quality, requires setup</li>
            <li><strong>Free API Services</strong> - Online services with free tiers</li>
            <li><strong>Online Tools</strong> - External free AI generators</li>
          </ul>
        </div>

        <div className="free-tools-section">
          <h4>🌐 Recommended Free Online Tools:</h4>
          <button 
            className="toggle-tools-button"
            onClick={() => setShowFreeTools(!showFreeTools)}
          >
            {showFreeTools ? 'Hide' : 'Show'} Free Online AI Tools
          </button>
          
          {showFreeTools && (
            <div className="free-tools-list">
              {freeTools.map((tool, index) => (
                <div key={index} className="tool-item">
                  <h5>{tool.name}</h5>
                  <p>{tool.description}</p>
                  <div className="tool-meta">
                    <span className="tool-type">{tool.type}</span>
                    <span className="tool-cost">{tool.cost}</span>
                    <span className="tool-setup">Setup: {tool.setup}</span>
                  </div>
                  <a 
                    href={tool.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="tool-link"
                  >
                    Visit {tool.name} →
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator; 