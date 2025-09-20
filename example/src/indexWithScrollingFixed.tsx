import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppWithScrollingFixed from './AppWithScrollingFixed';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppWithScrollingFixed />
  </React.StrictMode>
);
