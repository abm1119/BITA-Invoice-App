
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log("BITA: Application Bootstrap Initiated...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("BITA: Failure - Root element not found.");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("BITA: Application Mounted successfully.");
} catch (err) {
  console.error("BITA: Critical Crash during bootstrap:", err);
}
