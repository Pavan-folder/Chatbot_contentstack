import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface ChatProps {
  apiUrl: string;
  provider?: 'openai' | 'groq' | 'anthropic';
  apiKey?: string;
  initialGreeting?: boolean;
}

// Simple markdown renderer for basic formatting
const renderMarkdown = (text: string) => {
  // Handle bold text **text**
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Handle italic text *text*
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Handle code blocks ```code```
  formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre style="background: #f1f3f4; padding: 8px; border-radius: 4px; font-size: 13px; margin: 4px 0;"><code>$1</code></pre>');

  // Handle inline code `code`
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code style="background: #e8f0fe; padding: 2px 4px; border-radius: 3px; font-size: 12px;">$1</code>');

  // Handle line breaks
  formattedText = formattedText.replace(/\n/g, '<br/>');

  return formattedText;
};

const ModernChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const accumulatedTextRef = useRef('');

  const apiUrl = "http://localhost:3006";
  const provider = "groq";

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (messages.length === 0) {
      const greetingMessage: Message = {
        id: 'greeting',
        text: "Hi! I'm your AI assistant. How can I help you today?",
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

    const apiMessages = [
      { role: 'system', content: 'You are a helpful AI assistant. Provide clear, concise, and helpful responses.' },
      ...messages.map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
      { role: 'user', content: userMessage.text }
    ];

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiMessages, provider }),
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
      accumulatedTextRef.current = '';

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
                accumulatedTextRef.current += parsed.content;
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === botMessage.id ? { ...msg, text: accumulatedTextRef.current } : msg
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
        text: 'Sorry, I encountered an error. Please try again.',
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
      height: '600px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'auto' : 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    hiddenContainer: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
      transition: 'all 0.3s ease',
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexShrink: 0,
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      border: '2px solid rgba(255,255,255,0.3)',
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: '16px',
      fontWeight: '600',
      margin: 0,
      fontFamily: "'Inter', sans-serif",
    },
    subtitle: {
      fontSize: '12px',
      opacity: 0.8,
      margin: 0,
      marginTop: '2px',
    },
    closeButton: {
      background: 'rgba(255,255,255,0.1)',
      border: 'none',
      color: '#ffffff',
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.2s',
    },
    messages: {
      flex: 1,
      padding: '20px',
      overflowY: 'auto' as const,
      backgroundColor: '#fafbfc',
      scrollBehavior: 'smooth' as const,
    },
    message: {
      marginBottom: '16px',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    userMessage: {
      alignSelf: 'flex-end',
    },
    botMessage: {
      alignSelf: 'flex-start',
    },
    messageBubble: {
      maxWidth: '80%',
      padding: '12px 16px',
      borderRadius: '18px',
      wordWrap: 'break-word' as const,
      fontSize: '14px',
      lineHeight: '1.4',
      fontFamily: "'Inter', sans-serif",
    },
    userBubble: {
      backgroundColor: '#667eea',
      color: '#ffffff',
      borderBottomRightRadius: '4px',
    },
    botBubble: {
      backgroundColor: '#ffffff',
      color: '#333333',
      border: '1px solid #e1e5e9',
      borderBottomLeftRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    inputArea: {
      padding: '20px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e1e5e9',
      flexShrink: 0,
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e1e5e9',
      borderRadius: '24px',
      fontSize: '14px',
      fontFamily: "'Inter', sans-serif",
      outline: 'none',
      resize: 'none' as const,
      transition: 'border-color 0.2s',
    },
    sendButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      color: '#ffffff',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '16px',
      marginLeft: '8px',
      transition: 'transform 0.2s',
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      backgroundColor: '#ffffff',
      border: '1px solid #e1e5e9',
      borderRadius: '18px',
      borderBottomLeftRadius: '4px',
      alignSelf: 'flex-start',
      maxWidth: '80%',
      fontSize: '14px',
      color: '#666666',
    },
  };

  return (
    <div style={styles.widget}>
      {isOpen ? (
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.avatar}>🤖</div>
            <div style={styles.headerText}>
              <h3 style={styles.title}>AI Assistant</h3>
              <p style={styles.subtitle}>Online now</p>
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
                    message.text
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={styles.botMessage}>
                <div style={styles.loading}>
                  <span>AI is typing</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#667eea', animation: 'bounce 1.4s ease-in-out both infinite' }}></div>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#667eea', animation: 'bounce 1.4s ease-in-out both infinite', animationDelay: '0.16s' }}></div>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#667eea', animation: 'bounce 1.4s ease-in-out both infinite', animationDelay: '0.32s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputArea}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                style={styles.input}
                disabled={isLoading}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e1e5e9';
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                style={{
                  ...styles.sendButton,
                  opacity: (isLoading || !input.trim()) ? 0.5 : 1,
                  cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && input.trim()) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
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
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
          }}
        >
          💬
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ModernChatWidget;
