import React, { useState, useRef } from 'react';
import './AINumberPredictor.css';

const API_URL = '/api/tools/ai-number-predictor';

const AI_STEPS = [
  'Initializing neural network... 🤖',
  'Analyzing user input entropy...',
  'Running deep learning inference...',
  'Activating quantum prediction module...',
  'Cross-referencing with global dataset...',
  'Synthesizing multi-layered results...',
  'Optimizing prediction confidence...',
  'Finalizing output with AI consensus...'
];

const AINumberPredictor = () => {
  const [guess, setGuess] = useState('');
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [chartValue, setChartValue] = useState(0);
  const [showMatrix, setShowMatrix] = useState(false);
  const chartInterval = useRef(null);

  const handleInputChange = (e) => {
    setGuess(e.target.value.replace(/[^0-9]/g, ''));
    setError('');
  };

  const handleGuess = async (e) => {
    e.preventDefault();
    setResult('');
    setSteps([]);
    setCurrentStep(0);
    setError('');
    setShowChart(false);
    setShowMatrix(true);
    setChartValue(0);
    const num = Number(guess);
    if (isNaN(num) || num < 0 || num > 99) {
      setError('Please enter a number between 0 and 99!');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess: num })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong!');
      setSteps(AI_STEPS);
      // Animate steps
      let i = 0;
      const showStep = () => {
        setCurrentStep(i + 1);
        if (i === 2) setShowChart(true); // Show chart after 3rd step
        if (i < AI_STEPS.length - 1) {
          i++;
          setTimeout(showStep, 1200);
        } else {
          setTimeout(() => {
            setShowMatrix(false);
            setResult(data.result);
            setLoading(false);
          }, 1800);
        }
      };
      // Animate chart
      chartInterval.current = setInterval(() => {
        setChartValue((v) => (v < 100 ? v + Math.floor(Math.random() * 7) : 100));
      }, 180);
      showStep();
      setTimeout(() => clearInterval(chartInterval.current), 6000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setShowMatrix(false);
      setShowChart(false);
    }
  };

  const handleReset = () => {
    setGuess('');
    setSteps([]);
    setCurrentStep(0);
    setResult('');
    setError('');
    setLoading(false);
    setShowChart(false);
    setShowMatrix(false);
    setChartValue(0);
    clearInterval(chartInterval.current);
  };

  // Matrix effect (simple animated code rain)
  const renderMatrix = () => (
    <div className="ai-matrix-effect">
      {[...Array(16)].map((_, i) => (
        <div key={i} className="ai-matrix-col">
          {Array.from({ length: 8 }, () => String.fromCharCode(48 + Math.floor(Math.random() * 10))).join(' ')}
        </div>
      ))}
    </div>
  );

  // Animated confidence chart (SVG bar)
  const renderChart = () => (
    <div className="ai-confidence-chart">
      <div className="ai-confidence-label">AI Confidence</div>
      <svg width="220" height="32">
        <rect x="10" y="10" width="200" height="12" rx="6" fill="#eee" />
        <rect x="10" y="10" width={2 * chartValue} height="12" rx="6" fill="#43a047" style={{ transition: 'width 0.3s' }} />
        <text x="110" y="22" textAnchor="middle" fontSize="13" fill="#333" fontWeight="bold">{chartValue}%</text>
      </svg>
    </div>
  );

  // Animated result reveal
  const renderResult = () => (
    <div className="ai-number-predictor-result animate-result">
      <span className="ai-result-label">Final AI Prediction:</span>
      <span className="ai-result-number">{guess}</span>
    </div>
  );

  return (
    <div className="ai-number-predictor-card">
      <div className="ai-number-predictor-header">
        <span className="ai-number-predictor-icon">🔮</span>
        <h2 className="ai-number-predictor-title">AI Number Predictor</h2>
      </div>
      <div className="ai-number-predictor-desc">
        Think of a number between <b>0</b> and <b>99</b>. Our advanced AI will attempt to predict your secret number using neural networks, quantum algorithms, and global data analysis!
      </div>
      {/* Only show the form if not loading and no result is present */}
      {(!loading && !result) && (
        <form className="ai-number-predictor-form" onSubmit={handleGuess}>
          <input
            type="text"
            maxLength={2}
            value={guess}
            onChange={handleInputChange}
            placeholder="Enter your number..."
            disabled={loading}
            className="ai-number-predictor-input"
          />
          <button type="submit" className="ai-number-predictor-btn" disabled={loading || !guess}>Predict</button>
          <button type="button" className="ai-number-predictor-btn reset" onClick={handleReset} disabled={loading && !result}>Reset</button>
        </form>
      )}
      {error && <div className="ai-number-predictor-error">{error}</div>}
      <div className="ai-number-predictor-steps">
        {steps.slice(0, currentStep).map((step, idx) => (
          <div key={idx} className="ai-number-predictor-step animate-step">{step}</div>
        ))}
      </div>
      {showMatrix && loading && <div className="ai-matrix-container">{renderMatrix()}</div>}
      {showChart && loading && <div className="ai-chart-container">{renderChart()}</div>}
      {loading && !result && <div className="ai-number-predictor-wait">🔍 Processing...</div>}
      {result && renderResult()}
    </div>
  );
};

export default AINumberPredictor; 