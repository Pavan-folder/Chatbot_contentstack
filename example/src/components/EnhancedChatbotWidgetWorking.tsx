import React, { useState } from 'react';
import EnhancedChatFixed from './EnhancedChatFixed';

const EnhancedChatbotWidgetWorking: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  const styles = {
    container: {
      position: 'fixed' as const,
      bottom: '20px',
      right: '20px',
      width: isOpen ? '480px' : '60px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      borderRadius: '15px',
      overflow: 'hidden',
      transition: 'width 0.3s ease, height 0.3s ease',
      display: 'flex',
      flexDirection: 'column' as const,
      backgroundColor: '#ffffff',
      zIndex: 1000,
    },
    header: {
      background: 'linear-gradient(45deg, #0077b6, #00a8cc)',
      color: '#ffffff',
      padding: '10px 15px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      flexShrink: 0,
      userSelect: 'none' as const,
    },
    avatar: {
      width: '40px',
      height: '40px',
      backgroundColor: '#ffffff',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#0077b6',
      fontWeight: 'bold',
      fontSize: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      border: '2px solid #ffffff',
    },
    title: {
      fontSize: '16px',
      fontWeight: 'bold',
      textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
      fontFamily: "'Montserrat', sans-serif",
      flexGrow: 1,
    },
    closeButton: {
      fontSize: '20px',
      cursor: 'pointer',
      userSelect: 'none' as const,
    },
    chatContainer: {
      flex: 1,
      display: isOpen ? 'flex' : 'none',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      backgroundColor: '#f9f9f9',
    },
    toggleButton: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#0077b6',
      color: '#ffffff',
      fontSize: '30px',
      display: isOpen ? 'none' : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
      userSelect: 'none' as const,
    },
  };

  return (
    <div style={styles.container}>
      {isOpen ? (
        <>
          <div style={styles.header} onClick={() => setIsOpen(false)}>
            <div style={styles.avatar}>🌍</div>
            <span style={styles.title}>TravelMate Assistant</span>
            <span style={styles.closeButton} aria-label="Close chat">×</span>
          </div>
          <div style={styles.chatContainer}>
            <EnhancedChatFixed key={hasGreeted ? 'normal' : 'greeting'} apiUrl="http://localhost:3006" provider="groq" initialGreeting={!hasGreeted} />
          </div>
        </>
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
          <div
            style={styles.toggleButton}
            onClick={() => {
              setIsOpen(true);
              if (!hasGreeted) setHasGreeted(true);
            }}
            aria-label="Open chat"
          >
            💬
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedChatbotWidgetWorking;
