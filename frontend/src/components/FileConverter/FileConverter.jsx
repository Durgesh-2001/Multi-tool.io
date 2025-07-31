import React, { useState, useRef } from 'react';
import axios from 'axios';
import './FileConverter.css';
import PaymentModal from '../PaymentModal/PaymentModal';

const FileConverter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('pdf');
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const fileInputRef = useRef();

  const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setSuccess('');
      
      // Auto-detect target format based on file extension
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension === 'pdf') {
        setTargetFormat('docx');
      } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExtension)) {
        setTargetFormat('pdf');
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const supportedFormats = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
      
      if (supportedFormats.includes(fileExtension)) {
        setSelectedFile(file);
        setError('');
        setSuccess('');
        
        // Auto-detect target format
        if (fileExtension === 'pdf') {
          setTargetFormat('docx');
        } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExtension)) {
          setTargetFormat('pdf');
        }
      } else {
        setError('Please select a supported file format (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX)');
      }
    }
  };

  const getAvailableFormats = (fileExtension) => {
    const formats = {
      'pdf': ['docx', 'doc', 'txt'],
      'doc': ['pdf', 'docx', 'txt'],
      'docx': ['pdf', 'doc', 'txt'],
      'xls': ['pdf', 'xlsx', 'csv'],
      'xlsx': ['pdf', 'xls', 'csv'],
      'ppt': ['pdf', 'pptx'],
      'pptx': ['pdf', 'ppt']
    };
    return formats[fileExtension] || ['pdf', 'docx'];
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setError('Please select a file to convert');
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to use this feature');
      }

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      // First, try to deduct credits
      try {
        const deductResponse = await fetch(`${API_BASE_URL}/tools/deduct-credits`, {
          method: 'POST',
          headers
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

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('targetFormat', targetFormat);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const response = await axios.post(`${API_BASE_URL}/convert/file`, formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const originalName = selectedFile.name.replace(/\.[^/.]+$/, '');
      link.setAttribute('download', `${originalName}_converted.${targetFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess('File converted and downloaded successfully!');
      setSelectedFile(null);
      window.dispatchEvent(new Event('authChange'));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      let errorMessage = 'Conversion failed';
      
      if (err.response) {
        if (err.response.status === 402) {
          setIsPaymentModalOpen(true);
          errorMessage = 'You have insufficient credits or your free quota is over. Please upgrade your plan to continue.';
        } else {
            try {
                const errorJson = await err.response.data.text();
                const errorData = JSON.parse(errorJson);
                errorMessage = errorData.error || errorData.message || 'Conversion failed';
            } catch (e) {
                errorMessage = 'An unexpected error occurred during conversion.';
            }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    handleConvert();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileExtension = selectedFile ? selectedFile.name.split('.').pop().toLowerCase() : null;
  const availableFormats = fileExtension ? getAvailableFormats(fileExtension) : [];

  return (
    <div className="file-converter">
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
      <div className="converter-container">
        <h2 className="converter-title">📄 File Converter</h2>
        <p className="converter-subtitle">
          Convert your documents between different formats with ease. 
          Support for PDF, Word, Excel, and PowerPoint files.
        </p>

        <div className="file-input-section">
          <label htmlFor="file-input">Select File to Convert:</label>
          <div 
            className="file-upload-area"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              id="file-input"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleFileSelect}
              disabled={isConverting}
            />
            <div className="file-upload-icon">📁</div>
            <div className="file-upload-text">Drop your file here or click to browse</div>
            <div className="file-upload-hint">Supports PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX</div>
            <div className="file-upload-formats">Max file size: 50MB</div>
          </div>
          
          {selectedFile && (
            <div className="selected-file">
              <div className="file-icon">📄</div>
              <div className="file-info">
                <div className="file-name">{selectedFile.name}</div>
                <div className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button className="remove-file" onClick={removeFile} title="Remove file">
                ✕
              </button>
            </div>
          )}
        </div>

        {selectedFile && (
          <div className="format-section">
            <label htmlFor="target-format">Convert to:</label>
            <select
              id="target-format"
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value)}
              disabled={isConverting}
            >
              {availableFormats.map(format => (
                <option key={format} value={format}>
                  {format.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}

        {isConverting && (
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">Converting... {progress}%</div>
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

        <button
          className="convert-button"
          onClick={handleConvert}
          disabled={isConverting || !selectedFile}
        >
          {isConverting ? 'Converting...' : 'Convert File'}
        </button>

        <div className="supported-formats">
          <h3>Supported Formats</h3>
          <div className="format-grid">
            <div className="format-group">
              <strong>From:</strong>
              <ul>
                <li>PDF (.pdf)</li>
                <li>Word (.doc, .docx)</li>
                <li>Excel (.xls, .xlsx)</li>
                <li>PowerPoint (.ppt, .pptx)</li>
              </ul>
            </div>
            <div className="format-group">
              <strong>To:</strong>
              <ul>
                <li>PDF (.pdf)</li>
                <li>Word (.doc, .docx)</li>
                <li>Text (.txt)</li>
                <li>CSV (.csv) - Excel only</li>
              </ul>
            </div>
          </div>
          <div className="help-text">
            💡 Note: File conversion requires LibreOffice to be installed on the server. 
            If conversion fails, please ensure LibreOffice is properly installed.
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileConverter; 