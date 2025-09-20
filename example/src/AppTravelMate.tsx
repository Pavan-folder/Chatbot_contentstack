import React from 'react';
import TravelMateChatbotUpdated from './components/TravelMateChatbotUpdated';

const AppTravelMate: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>TravelMate Chatbot Demo</h1>
        <p>Experience the updated TravelMate chatbot with the new design system</p>
      </header>
      <main className="app-main">
        <TravelMateChatbotUpdated />
      </main>
    </div>
  );
};

export default AppTravelMate;
