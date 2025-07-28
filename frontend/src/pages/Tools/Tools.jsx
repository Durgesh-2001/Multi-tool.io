import React, { useState } from 'react';
import AudioConverter from '../../components/AudioConverter/AudioConverter';
import FileConverter from '../../components/FileConverter/FileConverter';
import SmileCam from '../../components/SmileCam/SmileCam';
import ImageGenerator from '../../components/ImageGenerator/ImageGenerator';
import ImageResizer from '../../components/ImageResizer/ImageResizer';
import ToolCard from '../../components/ToolCard/ToolCard';
import AINumberPredictor from '../../components/AINumberPredictor/AINumberPredictor';
import './Tools.css';

const tools = [
  {
    id: 'audio-converter',
    title: 'Audio Converter',
    description: 'Convert YouTube videos or local files to MP3, WAV, FLAC',
    icon: '🎵',
    component: AudioConverter,
    available: true
  },
  {
    id: 'file-converter',
    title: 'File Converter',
    description: 'Convert PDF to DOC/DOCX and vice versa',
    icon: '📄',
    component: FileConverter,
    available: true
  },
  {
    id: 'smilecam',
    title: 'Smile-Cam',
    description: 'Real-time camera capture with facial detection',
    icon: '📸',
    component: SmileCam,
    available: true
  },
  {
    id: 'image-resizer',
    title: 'Image Resizer',
    description: 'Resize, crop, and convert images with precision',
    icon: '🖼️',
    component: ImageResizer,
    available: true
  },
  {
    id: 'image-generator',
    title: 'AI Image Generator',
    description: 'Generate images from text prompts using AI',
    icon: '🎨',
    component: ImageGenerator,
    available: false,
    maintenance: true,
    maintenanceMessage: 'Under maintenance - We are working on finding a reliable free AI image generation solution. Stay tuned!'
  },
  {
    id: 'video-editor',
    title: 'Video Editor',
    description: 'Advanced video editing with AI-powered features',
    icon: '🎬',
    available: false,
    progress: '30%',
    eta: '2026',
    features: [
      'AI-powered video enhancement',
      'Auto-caption generation',
      'Background removal',
      'Video stabilization',
      'Multi-track editing'
    ]
  },
  {
    id: 'voice-cloner',
    title: 'Voice Cloner',
    description: 'Clone and modify voices with AI technology',
    icon: '🎤',
    available: false,
    progress: '45%',
    eta: '2026',
    features: [
      'Voice cloning from samples',
      'Real-time voice modification',
      'Multiple voice models',
      'Emotion control',
      'Language translation'
    ]
  },
  {
    id: 'code-generator',
    title: 'Code Generator',
    description: 'Generate code from natural language descriptions',
    icon: '💻',
    available: false,
    progress: '50%',
    eta: '2025',
    features: [
      'Multi-language support',
      'Code explanation',
      'Bug detection',
      'Performance optimization',
      'Documentation generation'
    ]
  },
  {
    id: 'data-analyzer',
    title: 'Data Analyzer',
    description: 'AI-powered data analysis and visualization',
    icon: '📊',
    available: false,
    progress: '20%',
    eta: '2027',
    features: [
      'Automated insights',
      'Interactive charts',
      'Predictive analytics',
      'Data cleaning',
      'Report generation'
    ]
  },
  {
    id: 'ai-number-predictor',
    title: 'AI Number Predictor',
    description: 'Experience advanced AI and algorithmic magic: let the system predict your secret number (0-99)!',
    icon: '🔮',
    component: AINumberPredictor,
    available: true
  }
];

const Tools = () => {
  const [selectedTool, setSelectedTool] = useState(null);

  const handleToolClick = (tool) => {
    if (tool.available) {
      setSelectedTool(tool);
    }
  };

  if (selectedTool) {
    const ToolComponent = selectedTool.component;
    return (
      <div className="tools-page">
        <div className="tool-header">
          <button className="back-button" onClick={() => setSelectedTool(null)}>
            ← Back to Tools
          </button>
          <h1>{selectedTool.title}</h1>
        </div>
        <ToolComponent />
      </div>
    );
  }

  return (
    <div className="tools-page">
      <h1 className="tools-title">Available Tools</h1>
      <p className="tools-subtitle">Discover our collection of powerful tools designed to make your digital tasks easier and more efficient.</p>
      
      <div className="tools-grid">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onClick={() => handleToolClick(tool)}
          />
        ))}
      </div>
    </div>
  );
};

export default Tools; 