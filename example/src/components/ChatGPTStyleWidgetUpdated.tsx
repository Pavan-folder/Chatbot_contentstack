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

  return (
    <div className="chatbot-widget" data-theme="chatgpt">
      {isOpen ? (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-avatar">🤖</div>
            <div className="chatbot-header-text">
              <h3 className="chatbot-title">AI Assistant</h3>
              <p className="chatbot-subtitle">Powered by advanced AI • Online</p>
            </div>
            <button
              className="chatbot-close-btn"
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
                    <div>{message.text}</div>
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
                  <span>AI is thinking</span>
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
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="chatbot-input"
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
                className="chatbot-send-btn"
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
        <button
          className="chatbot-toggle"
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
        </button>
      )}
    </div>
  );
};

export default ChatGPTStyleWidget;
