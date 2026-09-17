import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Emergency fix for Vercel White Screen:
// Forcefully unregister any stuck service workers and clear caches.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
  caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => caches.delete(key)));
  });
}

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#ff4444', backgroundColor: '#111', height: '100vh', width: '100vw', boxSizing: 'border-box', overflow: 'auto', fontFamily: 'monospace' }}>
          <h2>Google Craft - Fatal App Error</h2>
          <p>Please take a screenshot of this error and share it.</p>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#000', padding: '10px', borderRadius: '4px' }}>
            {this.state.error?.toString()}
          </pre>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: '#000', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer', background: '#fff', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
          >
            Clear Local Data & Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
