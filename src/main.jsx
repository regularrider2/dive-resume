import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('Deep Dive Error:', error, info);
  }
  render() {
    if (this.state.error) {
      return React.createElement('div', {
        style: { color: '#ff6666', padding: 40, fontFamily: 'monospace', background: '#0a1628', minHeight: '100vh' }
      },
        React.createElement('h1', null, 'Something went wrong'),
        React.createElement('pre', { style: { whiteSpace: 'pre-wrap', marginTop: 20 } }, String(this.state.error)),
        React.createElement('pre', { style: { whiteSpace: 'pre-wrap', marginTop: 10, color: '#aaa' } }, this.state.error?.stack)
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  React.createElement(ErrorBoundary, null, React.createElement(App))
);
