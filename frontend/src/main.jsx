import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect, useState } from 'react';

function GoogleClientProvider({ children }) {
  const [clientId, setClientId] = useState(undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/auth/google-client-id')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (!data.clientId) {
          setClientId(null);
          setError(true);
        } else {
          setClientId(data.clientId);
        }
      })
      .catch(() => {
        setClientId(null);
        setError(true);
      });
  }, []);

  if (clientId === undefined) return null; // loading spinner can be added here

  if (clientId === null) {
    // Backend is down or error occurred, render app without GoogleOAuthProvider
    return (
      <>
        {error && (
          <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', textAlign: 'center' }}>
            Google login is temporarily unavailable. Some features may be disabled.
          </div>
        )}
        {children}
      </>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleClientProvider>
      <App />
    </GoogleClientProvider>
  </StrictMode>,
)
