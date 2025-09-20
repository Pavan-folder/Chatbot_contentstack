import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Amazon-style markdown renderer
const renderMarkdown = (text: string) => {
  // Handle bold text **text**
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #0F1111;">$1</strong>');

  // Handle italic text *text*
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #565959;">$1</em>');

  // Handle code blocks ```code```
  formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre style="background: #F7F8F8; padding: 16px; border-radius: 8px; font-size: 13px; margin: 8px 0; border: 1px solid #D5D9D9; overflow-x: auto; font-family: \'Monaco\', \'Menlo\', monospace; color: #0F1111;">$1</pre>');

  // Handle inline code `code`
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code style="background: #F1F3F3; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-family: \'Monaco\', \'Menlo\', monospace; color: #D73A49;">$1</code>');

  // Handle headers # Header
  formattedText = formattedText.replace(/^### (.*$)/gim, '<h3 style="font-size: 18px; font-weight: 600; margin: 16px 0 8px 0; color: #0F1111;">$1</h3>');
  formattedText = formattedText.replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; font-weight: 600; margin: 20px 0 10px 0; color: #0F1111;">$1</h2>');
  formattedText = formattedText.replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; font-weight: 600; margin: 24px 0 12px 0; color: #0F1111;">$1</h1>');

  // Handle lists
  formattedText = formattedText.replace(/^\* (.*$)/gim, '<li style="margin: 4px 0; padding-left: 8px; color: #0F1111;">$1</li>');
  formattedText = formattedText.replace(/^- (.*$)/gim, '<li style="margin: 4px 0; padding-left: 8px; color: #0F1111;">$1</li>');

  // Handle line breaks
  formattedText = formattedText.replace(/\n\n/g, '</p><p style="margin: 8px 0; line-height: 1.5; color: #0F1111;">');
  formattedText = formattedText.replace(/\n/g, '<br/>');

  // Wrap in paragraph if not already wrapped
  if (!formattedText.startsWith('<')) {
    formattedText = '<p style="margin: 8px 0; line-height: 1.5; color: #0F1111;">' + formattedText + '</p>';
  }

  return formattedText;
};

const AmazonChatbotWithVisibleScroll: React.FC = () => {
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
        text: "Hello! I'm your customer service assistant. I'm here to help you with any questions about products, orders, or account issues. How can I assist you today?",
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
            { role: 'system', content: 'You are a helpful Amazon customer service assistant. Be friendly, professional, and provide accurate information about products, orders, shipping, returns, and account issues. Always aim to resolve customer concerns efficiently.' },
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
        text: 'I apologize for the inconvenience. I\'m experiencing technical difficulties. Please try again in a moment, or contact our customer service team directly at 1-888-280-4331.',
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
      width: '420px',
      height: '650px',
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(15, 17, 17, 0.15), 0 0 0 1px rgba(15, 17, 17, 0.08)',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'auto' : 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      fontFamily: "'Amazon Ember', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    },
    hiddenContainer: {
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #FF9900 0%, #146EB4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 6px 20px rgba(255, 153, 0, 0.4)',
      transition: 'all 0.3s ease',
      border: '3px solid rgba(255,255,255,0.3)',
    },
    header: {
      background: 'linear-gradient(135deg, #232F3E 0%, #37475A 100%)',
      color: '#FFFFFF',
      padding: '18px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      flexShrink: 0,
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    logo: {
      width: '36px',
      height: '36px',
      backgroundColor: '#FF9900',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#232F3E',
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: '17px',
      fontWeight: '600',
      margin: 0,
      letterSpacing: '-0.025em',
    },
    subtitle: {
      fontSize: '13px',
      opacity: 0.85,
      margin: 0,
      marginTop: '3px',
      fontWeight: '400',
    },
    closeButton: {
      background: 'rgba(255,255,255,0.1)',
      border: 'none',
      color: '#FFFFFF',
      width: '36px',
      height: '36px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '18px',
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
      padding: '24px',
      overflowY: 'auto' as const,
      backgroundColor: '#FAFAFA',
      scrollBehavior: 'smooth' as const,
      minHeight: 0,
      position: 'relative' as const,
      borderLeft: '4px solid #FF9900',
      borderRight: '4px solid #FF9900',
    },
    message: {
      marginBottom: '18px',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    userMessage: {
      alignSelf: 'flex-end',
      maxWidth: '82%',
    },
    botMessage: {
      alignSelf: 'flex-start',
      maxWidth: '85%',
    },
    messageBubble: {
      padding: '14px 18px',
      borderRadius: '12px',
      wordWrap: 'break-word' as const,
      fontSize: '15px',
      lineHeight: '1.4',
      position: 'relative' as const,
    },
    userBubble: {
      backgroundColor: '#232F3E',
      color: '#FFFFFF',
      borderBottomRightRadius: '4px',
    },
    botBubble: {
      backgroundColor: '#FFFFFF',
      color: '#0F1111',
      border: '1px solid #D5D9D9',
      borderBottomLeftRadius: '4px',
      boxShadow: '0 2px 4px rgba(15, 17, 17, 0.08)',
    },
    inputArea: {
      padding: '18px 24px',
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #D5D9D9',
      flexShrink: 0,
    },
    inputContainer: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '10px',
    },
    input: {
      flex: 1,
      padding: '12px 16px',
      border: '2px solid #D5D9D9',
      borderRadius: '8px',
      fontSize: '15px',
      outline: 'none',
      resize: 'none' as const,
      transition: 'all 0.2s',
      fontFamily: 'inherit',
      minHeight: '24px',
      maxHeight: '80px',
    },
    sendButton: {
      background: '#FF9900',
      border: '1px solid #A88734',
      color: '#0F1111',
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '18px',
      transition: 'all 0.2s',
      fontWeight: 'bold',
      flexShrink: 0,
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '14px 18px',
      backgroundColor: '#FFFFFF',
      border: '1px solid #D5D9D9',
      borderRadius: '12px',
      borderBottomLeftRadius: '4px',
      alignSelf: 'flex-start',
      maxWidth: '80%',
      fontSize: '15px',
      color: '#565959',
      boxShadow: '0 2px 4px rgba(15, 17, 17, 0.08)',
    },
    timestamp: {
      fontSize: '12px',
      color: '#565959',
      marginTop: '6px',
      textAlign: 'right' as const,
    },
  };

  return (
    <div style={styles.widget}>
      {isOpen ? (
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.logo}>A</div>
            <div style={styles.headerText}>
              <h3 style={styles.title}>Customer Service</h3>
              <p style={styles.subtitle}>We're here to help • Available 24/7</p>
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
                    <span>Assistant is typing</span>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#FF9900', animation: 'amazonPulse 1.4s ease-in-out infinite' }}></div>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#FF9900', animation: 'amazonPulse 1.4s ease-in-out infinite', animationDelay: '0.16s' }}></div>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#FF9900', animation: 'amazonPulse 1.4s ease-in-out infinite', animationDelay: '0.32s' }}></div>
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
                placeholder="How can we help you today?"
                style={styles.input}
                disabled={isLoading}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 80) + 'px';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#FF9900';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 153, 0, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#D5D9D9';
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
                    e.currentTarget.style.backgroundColor = '#E47911';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF9900';
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
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 153, 0, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 153, 0, 0.4)';
          }}
        >
          <span style={{ fontSize: '28px' }}>💬</span>
        </div>
      )}

      <style>{`
        @keyframes amazonPulse {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* HIGHLY VISIBLE SCROLL BAR */
        ::-webkit-scrollbar {
          width: 16px !important;
          background: #F7F8F8;
        }

        ::-webkit-scrollbar-track {
          background: #E5E5E5;
          border-radius: 8px;
          border: 2px solid #FFFFFF;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #FF9900 0%, #146EB4 100%);
          border-radius: 8px;
          border: 2px solid #FFFFFF;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #E47911 0%, #0F5A8C 100%);
          transform: scale(1.05);
        }

        ::-webkit-scrollbar-corner {
          background: #E5E5E5;
        }

        /* Firefox scrollbar */
        * {
          scrollbar-width: auto;
          scrollbar-color: #FF9900 #E5E5E5;
        }

        /* Make sure the messages container shows the scrollbar */
        .messages-scroll {
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
      `}</style>
    </div>
  );
};

export default AmazonChatbotWithVisibleScroll;
