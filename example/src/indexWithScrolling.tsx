import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWithScrolling from './AppWithScrolling';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <AppWithScrolling />
  </React.StrictMode>
);
