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

// Enhanced markdown renderer
const renderMarkdown = (text: string) => {
  // Handle bold text **text**
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #1a1a1a;">$1</strong>');

  // Handle italic text *text*
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em style="font-style: italic; color: #4a4a4a;">$1</em>');

  // Handle code blocks ```code```
  formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre style="background: #f7f7f8; padding: 16px; border-radius: 8px; font-size: 13px; margin: 8px 0; border: 1px solid #e5e5e5; overflow-x: auto;"><code style="font-family: \'Monaco\', \'Menlo\', monospace;">$1</code></pre>');

  // Handle inline code `code`
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code style="background: #f1f3f4; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-family: \'Monaco\', \'Menlo\', monospace; color: #d73a49;">$1</code>');

  // Handle headers # Header
  formattedText = formattedText.replace(/^### (.*$)/gim, '<h3 style="font-size: 18px; font-weight: 600; margin: 16px 0 8px 0; color: #1a1a1a;">$1</h3>');
  formattedText = formattedText.replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; font-weight: 600; margin: 20px 0 10px 0; color: #1a1a1a;">$1</h2>');
  formattedText = formattedText.replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; font-weight: 600; margin: 24px 0 12px 0; color: #1a1a1a;">$1</h1>');

  // Handle lists
  formattedText = formattedText.replace(/^\* (.*$)/gim, '<li style="margin: 4px 0; padding-left: 8px;">$1</li>');
  formattedText = formattedText.replace(/^- (.*$)/gim, '<li style="margin: 4px 0; padding-left: 8px;">$1</li>');

  // Handle line breaks
  formattedText = formattedText.replace(/\n\n/g, '</p><p style="margin: 8px 0; line-height: 1.5;">');
  formattedText = formattedText.replace(/\n/g, '<br/>');

  // Wrap in paragraph if not already wrapped
  if (!formattedText.startsWith('<')) {
    formattedText = '<p style="margin: 8px 0; line-height: 1.5; color: #333333;">' + formattedText + '</p>';
  }

  return formattedText;
};

const ChatGPTStyleWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        text: "Hello! I'm your AI assistant. I'm here to help you with any questions or tasks you might have. How can I assist you today?",
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
      { role: 'system', content: 'You are a helpful, intelligent AI assistant. Provide clear, accurate, and helpful responses. Use natural language and be conversational.' },
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
        text: 'I apologize, but I encountered an error processing your request. Please try again.',
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
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 25px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
      opacity: isOpen ? 1 : 0,
      pointerEvents: isOpen ? 'auto' : 'none',
      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    hiddenContainer: {
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #10a37f 0%, #34d399 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 10px 30px rgba(16, 163, 127, 0.4)',
      transition: 'all 0.3s ease',
      border: '2px solid rgba(255,255,255,0.2)',
    },
    header: {
      background: 'linear-gradient(135deg, #10a37f 0%, #34d399 100%)',
      color: '#ffffff',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      flexShrink: 0,
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    avatar: {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '22px',
      border: '2px solid rgba(255,255,255,0.3)',
      backdropFilter: 'blur(10px)',
    },
    headerText: {
      flex: 1,
    },
    title: {
      fontSize: '18px',
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
      color: '#ffffff',
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '18px',
      transition: 'all 0.2s',
      backdropFilter: 'blur(10px)',
    },
    messages: {
      flex: 1,
      padding: '24px',
      overflowY: 'auto' as const,
      backgroundColor: '#fafafa',
      scrollBehavior: 'smooth' as const,
    },
    message: {
      marginBottom: '20px',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    userMessage: {
      alignSelf: 'flex-end',
      maxWidth: '85%',
    },
    botMessage: {
      alignSelf: 'flex-start',
      maxWidth: '90%',
    },
    messageBubble: {
      padding: '16px 20px',
      borderRadius: '20px',
      wordWrap: 'break-word' as const,
      fontSize: '15px',
      lineHeight: '1.5',
      position: 'relative' as const,
    },
    userBubble: {
      backgroundColor: '#10a37f',
      color: '#ffffff',
      borderBottomRightRadius: '6px',
      boxShadow: '0 2px 12px rgba(16, 163, 127, 0.3)',
    },
    botBubble: {
      backgroundColor: '#ffffff',
      color: '#1a1a1a',
      border: '1px solid #e5e7eb',
      borderBottomLeftRadius: '6px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    inputArea: {
      padding: '24px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      flexShrink: 0,
    },
    inputContainer: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '12px',
    },
    input: {
      flex: 1,
      padding: '14px 18px',
      border: '2px solid #e5e7eb',
      borderRadius: '24px',
      fontSize: '15px',
      outline: 'none',
      resize: 'none' as const,
      transition: 'all 0.2s',
      fontFamily: 'inherit',
      minHeight: '24px',
      maxHeight: '120px',
    },
    sendButton: {
      background: 'linear-gradient(135deg, #10a37f 0%, #34d399 100%)',
      border: 'none',
      color: '#ffffff',
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '18px',
      transition: 'all 0.2s',
      boxShadow: '0 4px 16px rgba(16, 163, 127, 0.3)',
      flexShrink: 0,
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '16px 20px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '20px',
      borderBottomLeftRadius: '6px',
      alignSelf: 'flex-start',
      maxWidth: '80%',
      fontSize: '15px',
      color: '#6b7280',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    timestamp: {
      fontSize: '11px',
      color: '#9ca3af',
      marginTop: '4px',
      textAlign: 'right' as const,
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
              <p style={styles.subtitle}>Powered by advanced AI • Online</p>
            </div>
            <button
              style={styles.closeButton}
              onClick={() => setIsOpen(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'scale(1)';
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
                  <span>AI is thinking</span>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10a37f', animation: 'pulse 1.5s ease-in-out infinite' }}></div>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10a37f', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.2s' }}></div>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10a37f', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputArea}>
            <div style={styles.inputContainer}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                style={styles.input}
                disabled={isLoading}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#10a37f';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 163, 127, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
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
                  transform: (isLoading || !input.trim()) ? 'scale(1)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && input.trim()) {
                    e.currentTarget.style.transform = 'scale(1.08)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 163, 127, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 163, 127, 0.3)';
                }}
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={styles.hiddenContainer}
          onClick={() => setIsOpen(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 163, 127, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 163, 127, 0.4)';
          }}
        >
          <span style={{ fontSize: '28px' }}>💬</span>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default ChatGPTStyleWidget;
