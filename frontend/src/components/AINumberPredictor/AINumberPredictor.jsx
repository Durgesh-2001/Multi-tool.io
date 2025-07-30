import React, { useState, useRef, useEffect } from 'react';
import './AINumberPredictor.css';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

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
  const [inputLocked, setInputLocked] = useState(false);
  const chartInterval = useRef(null);
  const stepTimeout = useRef(null);

  // Allow any integer input (positive or negative)
  const handleInputChange = (e) => {
    const val = e.target.value;
    // Allow negative sign only at start, only digits after
    if (/^[-]?\d*$/.test(val)) {
      setGuess(val);
      setError('');
    }
  };

  const handleGuess = async (e) => {
    e.preventDefault();
    // Accept any integer (positive or negative)
    if (!guess || isNaN(Number(guess)) || !/^[-]?\d+$/.test(guess)) {
      setError('Please enter a valid integer number!');
      return;
    }
    setLoading(true);
    setShowMatrix(true);
    setInputLocked(true);

    try {
      const res = await fetch(`${API_BASE_URL}/tools/ai-number-predictor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ guess: Number(guess) })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `An error occurred: ${res.statusText}`);
      }
      const data = await res.json();
      setSteps(AI_STEPS);
      let i = 0;
      const showStep = () => {
        setCurrentStep(i + 1);
        if (i === 2) setShowChart(true);
        if (i < AI_STEPS.length - 1) {
          i++;
          stepTimeout.current = setTimeout(showStep, 1200);
        } else {
          stepTimeout.current = setTimeout(() => {
            setShowMatrix(false);
            let finalResult = typeof data.result === 'string' ? data.result.replace(/\.$/, '') : data.result;
            setResult(finalResult);
            setLoading(false);
          }, 1800);
        }
      };
      chartInterval.current = setInterval(() => {
        setChartValue((v) => {
          if (v >= 100) return 100;
          const remaining = 100 - v;
          const increment = Math.max(1, Math.min(Math.floor(Math.random() * 7), remaining));
          return v + increment;
        });
      }, 180);
      showStep();
      
      // Ensure we reach 100% by forcing it after 5.5 seconds
      setTimeout(() => {
        setChartValue(100);
        clearInterval(chartInterval.current);
      }, 5500);
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
    setInputLocked(false);
    clearInterval(chartInterval.current);
    clearTimeout(stepTimeout.current);
  };
  
  useEffect(() => {
    return () => {
      clearInterval(chartInterval.current);
      clearTimeout(stepTimeout.current);
    };
  }, []);

  const renderMatrix = () => (
    <div className="ai-matrix-effect">
      {[...Array(16)].map((_, i) => (
        <div key={i} className="ai-matrix-col">
          {Array.from({ length: 8 }, () => String.fromCharCode(48 + Math.floor(Math.random() * 10))).join(' ')}
        </div>
      ))}
    </div>
  );

  const renderChart = () => (
    <div className="ai-confidence-chart">
      <div className="ai-confidence-label theme-text">AI Confidence</div>
      <svg width="220" height="32">
        <rect x="10" y="10" width="200" height="12" rx="6" fill="#eee" />
        <rect x="10" y="10" width={2 * chartValue} height="12" rx="6" fill="#43a047" style={{ transition: 'width 0.3s' }} />
        <text x="110" y="22" textAnchor="middle" fontSize="13" className="chart-text" style={{ fill: 'currentColor' }} fontWeight="bold">{chartValue}%</text>
      </svg>
    </div>
  );

  const renderResult = () => (
    <div className="ai-number-predictor-result">
      <span className="ai-result-number">{result}</span>
      <button type="button" className="ai-number-predictor-btn try-again" onClick={handleReset}>Try Again</button>
    </div>
  );

  return (
    <div className="ai-number-predictor-card enhanced">
      <div className="ai-number-predictor-header">
        <span className="ai-number-predictor-icon">🔮</span>
        <h2 className="ai-number-predictor-title">AI Number Predictor</h2>
      </div>
      <div className="ai-number-predictor-desc theme-text">
        Think of <b>any integer number</b>. Our advanced AI will attempt to predict your secret number using neural networks, quantum algorithms, and global data analysis!
      </div>

      {/* Input area only visible before prediction */}
      {(!loading && !result) && (
        <form className="ai-number-predictor-form" onSubmit={handleGuess}>
          <input
            type="text"
            value={guess}
            onChange={handleInputChange}
            placeholder="Enter your number..."
            disabled={loading || inputLocked}
            className="ai-number-predictor-input"
          />
          <button type="submit" className="ai-number-predictor-btn" disabled={loading || !guess || inputLocked}>Predict</button>
        </form>
      )}

      {/* Hide input during prediction */}
      {loading && !result && (
        <>
          <div className="ai-number-predictor-steps">
            {steps.slice(0, currentStep).map((step, idx) => (
              <div key={idx} className="ai-number-predictor-step animate-step">{step}</div>
            ))}
          </div>
          {showMatrix && <div className="ai-matrix-container">{renderMatrix()}</div>}
          {showChart && <div className="ai-chart-container">{renderChart()}</div>}
          <div className="ai-number-predictor-wait">🔍 Processing...</div>
        </>
      )}

      {/* After prediction, show locked input above result for validation */}
      {result && (
        <>
          <div className="ai-number-predictor-form" style={{ marginBottom: '10px' }}>
            <input
              type="text"
              value={guess}
              disabled={true}
              className="ai-number-predictor-input locked"
              style={{ background: '#e8f0fe', color: '#222', fontWeight: 'bold', textAlign: 'center', fontSize: '1.2em', border: '2px solid #43a047', borderRadius: '8px' }}
            />
          </div>
          {renderResult()}
        </>
      )}

      {error && <div className="ai-number-predictor-error">{error}</div>}
    </div>
  );
};

export default AINumberPredictor;