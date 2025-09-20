import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppWorking from './AppWorking';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppWorking />
  </React.StrictMode>
);
