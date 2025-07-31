import React, { useState, useCallback, useMemo } from 'react';
import './Tools.css';

// Component Imports
import AudioConverter from '../../components/AudioConverter/AudioConverter';
import FileConverter from '../../components/FileConverter/FileConverter';
import SmileCam from '../../components/SmileCam/SmileCam';
import ImageGenerator from '../../components/ImageGenerator/ImageGenerator';
import ImageResizer from '../../components/ImageResizer/ImageResizer';
import ToolCard from '../../components/ToolCard/ToolCard';
import AINumberPredictor from '../../components/AINumberPredictor/AINumberPredictor';

// --- Production Enhancement: Data Separation ---
// Moved tool data outside the component to prevent re-declaration on every render.
// In a larger app, this would typically be in its own file (e.g., `data/tools.js`).
const toolData = [
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
        id: 'ai-number-predictor',
        title: 'AI Number Predictor',
        description: 'Let our advanced AI predict your secret number (0-99)!',
        icon: '🔮',
        component: AINumberPredictor,
        available: true
    },
    // Example of a future tool
    {
        id: 'video-editor',
        title: 'Video Editor',
        description: 'Advanced video editing with AI-powered features',
        icon: '🎬',
        available: false,
        progress: '30%',
        eta: '2026',
    },
];

// --- Production Enhancement: Componentization ---
// Breaking the UI into smaller, focused components improves readability and maintainability.

// Component to display the list of all tools
const ToolListView = ({ tools, onToolClick }) => (
    <>
        <div className="tools-header-main">
            <h1 className="tools-title">Available Tools</h1>
            <p className="tools-subtitle">Discover our collection of powerful tools designed to make your digital tasks easier and more efficient.</p>
        </div>
        <div className="tools-grid">
            {tools.map((tool) => (
                <ToolCard
                    key={tool.id}
                    tool={tool}
                    onClick={() => onToolClick(tool)}
                />
            ))}
        </div>
    </>
);

// Component to display the selected tool
const SelectedToolView = ({ tool, onBackClick }) => {
    // Memoize the component to prevent re-creating it on every render
    const ToolComponent = useMemo(() => tool.component, [tool]);

    return (
        <>
            {/* --- Layout Fix: Header structure updated --- */}
            <div className="tool-header">
                <button className="back-button" onClick={onBackClick}>
                    ← Back to Tools
                </button>
                <h1 className="tool-header-title">{tool.title}</h1>
            </div>
            <div className="tool-component-container">
                <ToolComponent />
            </div>
        </>
    );
};


const Tools = () => {
    const [selectedTool, setSelectedTool] = useState(null);

    // --- Production Enhancement: Memoization ---
    // useCallback prevents this function from being re-created on every render,
    // which optimizes performance for child components like ToolCard.
    const handleToolClick = useCallback((tool) => {
        if (tool.available) {
            setSelectedTool(tool);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, []); // Empty dependency array means the function is created only once.

    const handleBackClick = useCallback(() => {
        setSelectedTool(null);
    }, []);

    return (
        <div className="tools-page">
            {selectedTool ? (
                <SelectedToolView tool={selectedTool} onBackClick={handleBackClick} />
            ) : (
                <ToolListView tools={toolData} onToolClick={handleToolClick} />
            )}
        </div>
    );
};

export default Tools;
