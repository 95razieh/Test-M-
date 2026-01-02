
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill for process.env which is missing in plain browser environments
// This prevents the app from crashing when accessing process.env.API_KEY
(window as any).process = (window as any).process || { env: {} };

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
