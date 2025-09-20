import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// TravelMate markdown renderer
const renderMarkdown = (text: string) => {
  // Handle bold text **text**
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #2563eb;">$1</strong>');

  // Handle italic text *text*
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #64748b;">$1</em>');

  // Handle code blocks ```code```
  formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 13px; margin: 8px 0; border: 1px solid #e2e8f0; overflow-x: auto; font-family: \'Monaco\', \'Menlo\', monospace; color: #1e293b;">$1</pre>');

  // Handle inline code `code`
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-family: \'Monaco\', \'Menlo\', monospace; color: #dc2626;">$1</code>');

  // Handle headers # Header
  formattedText = formattedText.replace(/^### (.*$)/gim, '<h3 style="font-size: 18px; font-weight: 600; margin: 16px 0 8px 0; color: #1e293b;">$1</h3>');
  formattedText = formattedText.replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; font-weight: 600; margin: 20px 0 10px 0; color: #1e293b;">$1</h2>');
  formattedText = formattedText.replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; font-weight: 600; margin: 24px 0 12px 0; color: #1e293b;">$1</h1>');

  // Handle lists
  formattedText = formattedText.replace(/^\* (.*$)/gim, '<li style="margin: 4px 0; padding-left: 8px; color: #1e293b;">$1</li>');
  formattedText = formattedText.replace(/^- (.*$)/gim, '<li style="margin: 4px 0; padding-left: 8px; color: #1e293b;">$1</li>');

  // Handle line breaks
  formattedText = formattedText.replace(/\n\n/g, '</p><p style="margin: 8px 0; line-height: 1.5; color: #1e293b;">');
  formattedText = formattedText.replace(/\n/g, '<br/>');

  // Wrap in paragraph if not already wrapped
  if (!formattedText.startsWith('<')) {
    formattedText = '<p style="margin: 8px 0; line-height: 1.5; color: #1e293b;">' + formattedText + '</p>';
  }

  return formattedText;
};

const TravelMateChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const apiUrl = "http://localhost:3006";
  const provider = "groq";

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (messages.length === 0) {
      const greetingMessage: Message = {
        id: 'greeting',
        text: "Hello! I'm your TravelMate AI assistant. I'm here to help you plan your perfect trip, discover amazing destinations, and make your travel dreams come true. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([greetingMessage]);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a helpful TravelMate AI assistant. Be friendly, professional, and provide accurate information about travel destinations, planning, bookings, and travel tips. Always aim to make travel planning easy and enjoyable for users.' },
            ...messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
            { role: 'user', content: userMessage.text }
          ],
          provider
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulatedText += parsed.content;
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === botMessage.id ? { ...msg, text: accumulatedText } : msg
                  )
                );
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: 'I apologize for the inconvenience. I\'m experiencing technical difficulties. Please try again in a moment, or contact our support team.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const styles = {
    widget: {
      position: 'fixed' as const,
      bottom: '20px',
      right: '20px',
      zIndex: 1000,
    },
    container: {
      width: '380px',
      height: '500px', // Fixed height - won't take full screen
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'auto' : 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    hiddenContainer: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
      transition: 'all 0.3s ease',
      border: '2px solid rgba(255,255,255,0.2)',
    },
    header: {
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      color: '#FFFFFF',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexShrink: 0, // Header always stays visible
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    logo: {
      width: '32px',
      height: '32px',
      backgroundColor: '#3b82f6',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: '16px',
      fontWeight: '600',
      margin: 0,
      letterSpacing: '-0.025em',
    },
    subtitle: {
      fontSize: '12px',
      opacity: 0.85,
      margin: 0,
      marginTop: '2px',
      fontWeight: '400',
    },
    closeButton: {
      background: 'rgba(255,255,255,0.1)',
      border: 'none',
      color: '#FFFFFF',
      width: '32px',
      height: '32px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'all 0.2s',
    },
    messagesContainer: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      minHeight: 0,
      position: 'relative' as const,
    },
    messages: {
      flex: 1,
      padding: '16px 20px',
      overflowY: 'auto' as const,
      backgroundColor: '#f8fafc',
      scrollBehavior: 'smooth' as const,
      minHeight: 0,
      position: 'relative' as const,
    },
    message: {
      marginBottom: '12px',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    userMessage: {
      alignSelf: 'flex-end',
      maxWidth: '80%',
    },
    botMessage: {
      alignSelf: 'flex-start',
      maxWidth: '85%',
    },
    messageBubble: {
      padding: '12px 16px',
      borderRadius: '16px',
      wordWrap: 'break-word' as const,
      fontSize: '14px',
      lineHeight: '1.4',
      position: 'relative' as const,
    },
    userBubble: {
      backgroundColor: '#3b82f6',
      color: '#FFFFFF',
      borderBottomRightRadius: '4px',
    },
    botBubble: {
      backgroundColor: '#FFFFFF',
      color: '#1e293b',
      border: '1px solid #e2e8f0',
      borderBottomLeftRadius: '4px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    inputArea: {
      padding: '16px 20px',
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #e2e8f0',
      flexShrink: 0,
    },
    inputContainer: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '8px',
    },
    input: {
      flex: 1,
      padding: '10px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      resize: 'none' as const,
      transition: 'all 0.2s',
      fontFamily: 'inherit',
      minHeight: '20px',
      maxHeight: '60px',
    },
    sendButton: {
      background: '#3b82f6',
      border: '1px solid #2563eb',
      color: '#FFFFFF',
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'all 0.2s',
      fontWeight: 'bold',
      flexShrink: 0,
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      backgroundColor: '#FFFFFF',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      borderBottomLeftRadius: '4px',
      alignSelf: 'flex-start',
      maxWidth: '80%',
      fontSize: '14px',
      color: '#64748b',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    timestamp: {
      fontSize: '11px',
      color: '#94a3b8',
      marginTop: '4px',
      textAlign: 'right' as const,
    },
  };

  return (
    <div style={styles.widget}>
      {isOpen ? (
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.logo}>TM</div>
            <div style={styles.headerText}>
              <h3 style={styles.title}>TravelMate Assistant</h3>
              <p style={styles.subtitle}>Your AI travel companion • Available 24/7</p>
            </div>
            <button
              style={styles.closeButton}
              onClick={() => setIsOpen(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
            >
              ×
            </button>
          </div>

          <div style={styles.messagesContainer}>
            <div ref={messagesContainerRef} style={styles.messages}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    ...styles.message,
                    ...(message.sender === 'user' ? styles.userMessage : styles.botMessage)
                  }}
                >
                  <div
                    style={{
                      ...styles.messageBubble,
                      ...(message.sender === 'user' ? styles.userBubble : styles.botBubble)
                    }}
                  >
                    {message.sender === 'bot' ? (
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
                    ) : (
                      <div>{message.text}</div>
                    )}
                  </div>
                  <div style={styles.timestamp}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div style={styles.botMessage}>
                  <div style={styles.loading}>
                    <span>TravelMate is thinking</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#3b82f6', animation: 'travelMatePulse 1.4s ease-in-out infinite' }}></div>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#3b82f6', animation: 'travelMatePulse 1.4s ease-in-out infinite', animationDelay: '0.16s' }}></div>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#3b82f6', animation: 'travelMatePulse 1.4s ease-in-out infinite', animationDelay: '0.32s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div style={styles.inputArea}>
            <div style={styles.inputContainer}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your travel plans..."
                style={styles.input}
                disabled={isLoading}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 60) + 'px';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6';
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                style={{
                  ...styles.sendButton,
                  opacity: (isLoading || !input.trim()) ? 0.6 : 1,
                  cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && input.trim()) {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={styles.hiddenContainer}
          onClick={() => setIsOpen(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.4)';
          }}
        >
          <span style={{ fontSize: '24px' }}>✈️</span>
        </div>
      )}

      <style>{`
        @keyframes travelMatePulse {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* VISIBLE SCROLL BAR STYLING */
        ::-webkit-scrollbar {
          width: 12px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 6px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 6px;
          border: 2px solid #f8fafc;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        }

        ::-webkit-scrollbar-corner {
          background: #f1f5f9;
        }

        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default TravelMateChatbot;
