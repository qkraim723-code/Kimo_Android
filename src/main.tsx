import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// ──── Global Console Monitor to Streamline Sandbox Permissions ────
const originalError = console.error;
console.error = (...args: any[]) => {
  const isPermissionError = args.some(arg => 
    arg && (
      (typeof arg === 'string' && (arg.includes('PERMISSION_DENIED') || arg.includes('Permission denied') || arg.includes('permission-denied'))) ||
      (typeof arg === 'object' && arg.message && (arg.message.includes('permission') || arg.message.includes('Permission') || arg.message.includes('denied')))
    )
  );

  if (isPermissionError) {
    console.warn("[Database Security Sandbox Notice]: Bypassed background database permission warning.", ...args);
    return;
  }
  originalError(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

