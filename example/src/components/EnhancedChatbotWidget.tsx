import React, { useState } from 'react';
import EnhancedChatFixed from './EnhancedChatFixed.tsx';
import '../styles/chatbot-design-system.css';

const EnhancedChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  return (
    <div className="chatbot-widget" data-theme="travel">
      {isOpen ? (
        <div className="chatbot-container">
          <div className="chatbot-header" onClick={() => setIsOpen(false)}>
            <div className="chatbot-avatar">🌍</div>
            <div className="chatbot-header-text">
              <h3 className="chatbot-title">TravelMate Assistant</h3>
              <p className="chatbot-subtitle">Your travel companion</p>
            </div>
            <button className="chatbot-close-btn" aria-label="Close chat">×</button>
          </div>
          <div className="chatbot-messages">
            <EnhancedChatFixed key={hasGreeted ? 'normal' : 'greeting'} apiUrl="http://localhost:3006" provider="groq" initialGreeting={!hasGreeted} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            marginBottom: '6px',
            fontSize: '18px',
            color: '#ffffff',
            fontWeight: 'bold',
            fontFamily: "'Montserrat', sans-serif",
            backgroundColor: '#0077b6',
            padding: '8px 20px',
            borderRadius: '24px',
            boxShadow: '0 6px 12px rgba(0,0,0,0.25)',
            whiteSpace: 'normal',
            maxWidth: '240px',
            textAlign: 'center',
            position: 'relative',
            bottom: '12px',
            zIndex: 1001,
            overflow: 'visible',
            textOverflow: 'clip',
            userSelect: 'none',
            cursor: 'default',
          }}>
            Hi, I am chat
          </div>
          <button
            className="chatbot-toggle"
            onClick={() => {
              setIsOpen(true);
              if (!hasGreeted) setHasGreeted(true);
            }}
            aria-label="Open chat"
          >
            💬
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedChatbotWidget;
