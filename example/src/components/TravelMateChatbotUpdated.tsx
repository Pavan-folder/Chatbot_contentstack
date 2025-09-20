import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../styles/chatbot-design-system.css';

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

const TravelMateChatbotUpdated: React.FC = () => {
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

  return (
    <div className="chatbot-widget" data-theme="travel">
      {isOpen ? (
        <div className="chatbot-container">
          <div className="chatbot-header" onClick={() => setIsOpen(false)}>
            <div className="chatbot-avatar">✈️</div>
            <div className="chatbot-header-text">
              <h3 className="chatbot-title">TravelMate Assistant</h3>
              <p className="chatbot-subtitle">Your AI travel companion</p>
            </div>
            <button className="chatbot-close-btn" aria-label="Close chat">×</button>
          </div>
          <div className="chatbot-messages" ref={messagesContainerRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message ${message.sender === 'user' ? 'chatbot-message-user' : 'chatbot-message-bot'}`}
              >
                <div
                  className={`chatbot-message-bubble ${message.sender === 'user' ? 'chatbot-message-bubble-user' : 'chatbot-message-bubble-bot'}`}
                >
                  {message.sender === 'bot' ? (
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
                  ) : (
                    <div>{message.text}</div>
                  )}
                </div>
                <div className="chatbot-message-timestamp">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="chatbot-message chatbot-message-bot">
                <div className="chatbot-message-bubble chatbot-message-bubble-bot chatbot-loading">
                  <span>TravelMate is thinking</span>
                  <div className="chatbot-typing-indicator">
                    <div className="chatbot-typing-dot"></div>
                    <div className="chatbot-typing-dot"></div>
                    <div className="chatbot-typing-dot"></div>
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
                placeholder="Ask me about your travel plans..."
                className="chatbot-input"
                disabled={isLoading}
                rows={1}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 60) + 'px';
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="chatbot-send-btn"
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
        <div className="chatbot-toggle-container">
          <button
            className="chatbot-toggle"
            onClick={() => setIsOpen(true)}
            aria-label="Open chat"
          >
            ✈️
          </button>
        </div>
      )}
    </div>
  );
};

export default TravelMateChatbotUpdated;
