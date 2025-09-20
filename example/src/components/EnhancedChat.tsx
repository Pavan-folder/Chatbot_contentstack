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

const EnhancedChat = ({ apiUrl, provider = 'openai', apiKey, initialGreeting = false }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const accumulatedTextRef = useRef('');
  const lastScrollTopRef = useRef(0);

  // Smart scroll to bottom - only if user is already at bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    messagesContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Check if user is at bottom of chat
  const checkScrollPosition = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px threshold
    setIsAtBottom(atBottom);
    setShowScrollToBottom(!atBottom && messages.length > 3);
    lastScrollTopRef.current = scrollTop;
  }, [messages.length]);

  // Enhanced scroll handler
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    checkScrollPosition();
  }, [checkScrollPosition]);

  // Auto-scroll on new messages (only if at bottom)
  useEffect(() => {
    if (isAtBottom && messages.length > 0) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        scrollToBottom('smooth');
      }, 100);
    }
  }, [messages, isAtBottom, scrollToBottom]);

  useEffect(() => {
    if (initialGreeting) {
      const greetingMessage: Message = {
        id: 'greeting',
        text: "Hi! I'm TravelMate Assistant. How can I help you plan your trip today?",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([greetingMessage]);
    }
  }, [initialGreeting]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    const apiMessages = [
      { role: 'system', content: 'You are a helpful chat agent. Answer the user\'s question directly.' },
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
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
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
      // Smart scroll after receiving bot message
      setTimeout(() => {
        if (isAtBottom) {
          scrollToBottom('smooth');
        }
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: 'Sorry, there was an error processing your message.',
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
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Scroll to top button */}
      {messages.length > 5 && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'absolute',
            top: '10px',
            right: '20px',
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            backgroundColor: '#f1f1f1',
            color: '#666',
            border: '1px solid #ddd',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            zIndex: 10,
          }}
          title="Scroll to top"
        >
          ↑
        </button>
      )}

      <div
        ref={messagesContainerRef}
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          scrollBehavior: 'smooth'
        }}
        onScroll={handleScroll}
      >
        {messages.map((message, index) => (
          <div key={message.id} style={{ marginBottom: '12px', textAlign: message.sender === 'user' ? 'right' : 'left' }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: message.sender === 'user' ? '#007bff' : '#f1f1f1',
              color: message.sender === 'user' ? 'white' : 'black',
              maxWidth: '80%',
              wordWrap: 'break-word',
            }}>
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ textAlign: 'left', marginBottom: '12px' }}>
            <div style={{ display: 'inline-block', padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f1f1f1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>Typing</span>
                <span style={{ animation: 'blink 1s infinite' }}>.</span>
                <span style={{ animation: 'blink 1s infinite 0.2s' }}>.</span>
                <span style={{ animation: 'blink 1s infinite 0.4s' }}>.</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <button
          onClick={() => scrollToBottom('smooth')}
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '20px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            zIndex: 10,
          }}
          title="Scroll to bottom"
        >
          ↓
        </button>
      )}

      <div style={{ padding: '16px', borderTop: '1px solid #ccc' }}>
        <div style={{ display: 'flex' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            style={{ marginLeft: '8px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Send
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default EnhancedChat;
