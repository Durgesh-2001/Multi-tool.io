import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as faceapi from 'face-api.js';
import './SmileCam.css';
import PaymentModal from '../PaymentModal/PaymentModal';

const SmileCam = () => {
  // --- State Management ---
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);
  const [cameraMode, setCameraMode] = useState('user');
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [modalStep, setModalStep] = useState(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isSmileDetected, setIsSmileDetected] = useState(false);
  const [autoCaptureMode, setAutoCaptureMode] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // --- Refs ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

  // --- Core Functions (defined with useCallback) ---

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    setStream(null);
    setIsActive(false);
    setIsSmileDetected(false);
  }, []);

  const startCamera = useCallback(async (mode) => {
    if (streamRef.current) {
      stopCamera();
    }
    setCameraError('');
    const currentCameraMode = mode || cameraMode;
    const constraints = { video: { facingMode: currentCameraMode, width: { ideal: 1280 }, height: { ideal: 720 } } };

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsActive(true);
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError('Failed to access camera. Please check permissions.');
    }
  }, [cameraMode, stopCamera]);

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    setProcessingResult(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      setCapturedImage(blob);
      setIsCapturing(false);
      stopCamera();
    }, 'image/jpeg', 0.9);
  }, [isCapturing, stopCamera]);

  const processFinalImage = useCallback(async (imageBlob) => {
    if (!modelsLoaded) return { success: false, error: "AI Models not loaded." };

    try {
      const image = await faceapi.bufferToImage(imageBlob);

      const detections = await faceapi
        .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections) {
        const smileValue = detections.expressions.happy > 0.7 ? 'Yes' : 'No';
        const confidenceValue = (detections.expressions.happy * 100).toFixed(0);
        return {
          success: true,
          expressions: { smile: smileValue, confidence: confidenceValue },
        };
      } else {
        return { success: false, error: 'Could not detect a face in the image.' };
      }
    } catch (error) {
      console.error('Error in processFinalImage:', error);
      return { success: false, error: 'Failed to analyze the image.' };
    }
  }, [modelsLoaded]);

  const processImage = useCallback(async () => {
    if (!capturedImage) return;
    setIsProcessing(true);

    const analysisResult = await processFinalImage(capturedImage);
    
    setProcessingResult(analysisResult);

    const token = localStorage.getItem('token');
    if (token && analysisResult.success) {
      try {
        await axios.post(`${API_BASE_URL}/tools/deduct-credits`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        window.dispatchEvent(new Event('authChange'));
      } catch (error) {
        console.error("Credit deduction failed:", error);
      }
    }

    setIsProcessing(false);
  }, [capturedImage, processFinalImage, API_BASE_URL]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setProcessingResult(null);
    startCamera();
  }, [startCamera]);

  const downloadImage = useCallback(() => {
    if (!capturedImage) return;
    const url = URL.createObjectURL(capturedImage);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smilecam_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [capturedImage]);

  const switchCamera = useCallback(() => {
    const newMode = cameraMode === 'user' ? 'environment' : 'user';
    setCameraMode(newMode);
    startCamera(newMode);
  }, [cameraMode, startCamera]);
  
  const toggleAutoCapture = () => setAutoCaptureMode(prev => !prev);

  const handleDeviceSelect = useCallback((device) => {
    if (device === 'mobile') {
      setModalStep(2);
    } else {
      setShowModal(false);
      startCamera('user');
    }
  }, [startCamera]);

  const handleCameraSelect = useCallback((mode) => {
    setShowModal(false);
    startCamera(mode);
  }, [startCamera]);

  const handlePaymentSuccess = () => setIsPaymentModalOpen(false);

  // --- useEffect Hooks ---

  useEffect(() => {
    const checkMobile = () => /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
    setIsMobile(checkMobile());

    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Failed to load face-api models:", error);
        setCameraError("Could not load AI models. Please refresh.");
      }
    };
    loadModels();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (isActive && modelsLoaded && autoCaptureMode) {
      detectionIntervalRef.current = setInterval(async () => {
        if (videoRef.current && !videoRef.current.paused) {
          const detections = await faceapi
            .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          const smile = detections[0]?.expressions.happy > 0.8;
          setIsSmileDetected(smile);
          if (smile) {
            handleCapture();
          }
        }
      }, 700);
    } else {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    }
    return () => clearInterval(detectionIntervalRef.current);
  }, [isActive, modelsLoaded, autoCaptureMode, handleCapture]);


  return (
    <div className="smilecam">
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            {modalStep === 1 ? (
              <>
                <h2>Welcome to SmileCam</h2>
                <p>Please confirm your device type:</p>
                <div className="modal-btn-group">
                  <button className="modal-btn" onClick={() => handleDeviceSelect('laptop')}>💻 Laptop / PC</button>
                  <button className="modal-btn" onClick={() => handleDeviceSelect('mobile')}>📱 Mobile</button>
                </div>
              </>
            ) : (
              <>
                <h2>Choose Camera</h2>
                <p>Which camera would you like to use?</p>
                <div className="modal-btn-group">
                  <button className="modal-btn" onClick={() => handleCameraSelect('user')}>🤳 Front</button>
                  <button className="modal-btn" onClick={() => handleCameraSelect('environment')}>📷 Back</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="smilecam-container">
        <div className="smilecam-title">📸 SmileCam</div>
        <div className="smilecam-subtitle">AI-powered camera that captures photos when you smile.</div>

        <div className="camera-section">
          <div className="camera-container">
            {cameraError && <div className="camera-error">{cameraError}</div>}
            
            <video ref={videoRef} autoPlay playsInline muted className={`camera-video ${!capturedImage && isActive ? 'visible' : ''}`} />
            
            {capturedImage && <img src={URL.createObjectURL(capturedImage)} alt="Captured" className="captured-image visible" />}

            {!isActive && !capturedImage && (
              <div className="camera-placeholder">
                {!modelsLoaded ? "Loading AI Models..." : "Start camera to begin"}
              </div>
            )}
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {isProcessing && <div className="processing-overlay"><span>Processing...</span></div>}

            {isActive && (
              <div className="smile-indicator">
                <span className={`smile-dot ${isSmileDetected ? 'smile-detected' : ''}`}></span>
                {autoCaptureMode ? (isSmileDetected ? 'Smile!' : 'Detecting...') : 'Ready'}
              </div>
            )}
          </div>

          {processingResult && (
            <div className={`analysis-result ${processingResult.success ? 'success' : 'error'}`}>
              {processingResult.success ? (
                <>
                  <p>Smile Detected: {processingResult.expressions.smile}</p>
                  <p>Confidence: {processingResult.expressions.confidence}%</p>
                </>
              ) : (
                <p>{processingResult.error}</p>
              )}
            </div>
          )}

          <div className="controls-section">
            {!isActive && !capturedImage ? (
              <button className="control-button start" onClick={() => startCamera(cameraMode)} disabled={!modelsLoaded}>
                {modelsLoaded ? 'Start Camera' : 'Loading Models...'}
              </button>
            ) : null}

            {isActive && (
              <div className="live-controls">
                <button className="control-button" onClick={handleCapture} disabled={isCapturing}>📸 Capture</button>
                {isMobile && <button className="control-button" onClick={switchCamera}>🔄 Switch</button>}
                <button className={`control-button ${autoCaptureMode ? 'active' : ''}`} onClick={toggleAutoCapture}>🤖 Auto</button>
                <button className="control-button stop" onClick={stopCamera}>⏹️ Stop</button>
              </div>
            )}

            {capturedImage && (
              <div className="captured-controls">
                <button className="control-button" onClick={retakePhoto}>🔄 Retake</button>
                <button className="control-button process" onClick={processImage} disabled={isProcessing}>🔍 Analyze</button>
                <button className="control-button" onClick={downloadImage}>💾 Download</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmileCam;