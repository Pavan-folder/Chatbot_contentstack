import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../styles/chatbot-design-system.css';

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

  return (
    <div className="chatbot-widget" data-theme="modern">
      {isOpen ? (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-avatar">🤖</div>
            <div className="chatbot-header-text">
              <h3 className="chatbot-title">AI Assistant</h3>
              <p className="chatbot-subtitle">Online now</p>
            </div>
            <button
              className="chatbot-close-btn"
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

          <div ref={messagesContainerRef} className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message ${message.sender === 'user' ? 'user' : 'bot'}`}
              >
                <div
                  className={`chatbot-message-bubble ${message.sender === 'user' ? 'user' : 'bot'}`}
                >
                  {message.sender === 'bot' ? (
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
                  ) : (
                    message.text
                  )}
                </div>
                <div className="chatbot-timestamp">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-message bot">
                <div className="chatbot-loading">
                  <span>AI is typing</span>
                  <div className="chatbot-loading-dots">
                    <div className="chatbot-loading-dot"></div>
                    <div className="chatbot-loading-dot"></div>
                    <div className="chatbot-loading-dot"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-area">
            <div className="chatbot-input-container">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="chatbot-input"
                disabled={isLoading}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#6366f1';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="chatbot-send-btn"
                onMouseEnter={(e) => {
                  if (!isLoading && input.trim()) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.3)';
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          className="chatbot-toggle"
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
        </button>
      )}
    </div>
  );
};

export default ModernChatWidget;
