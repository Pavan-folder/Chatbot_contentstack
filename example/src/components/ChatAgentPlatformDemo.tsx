import React, { useState, useEffect } from 'react';
import { ChatAgentProvider, useChatAgentSDK, Message } from '../../sdk/src/ChatAgentSDKFixed';

const ChatAgentPlatformDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'providers' | 'contentstack' | 'config'>('chat');
  const [providers, setProviders] = useState<any[]>([]);
  const [contentstackResults, setContentstackResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    sdk
  } = useChatAgentSDK({
    apiUrl: 'http://localhost:3006',
    defaultProvider: 'openai',
    streaming: true
  });

  // Load providers on component mount
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const availableProviders = await sdk.getProviders();
        setProviders(availableProviders);
      } catch (error) {
        console.error('Failed to load providers:', error);
      }
    };
    loadProviders();
  }, [sdk]);

  // Search Contentstack content
  const handleSearchContent = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await sdk.searchContent(searchQuery);
      setContentstackResults(results);
    } catch (error) {
      console.error('Failed to search content:', error);
    }
  };

  // Test a provider
  const testProvider = async (providerId: string) => {
    try {
      const result = await sdk.testProvider(providerId);
      alert(`Provider test ${result.success ? 'successful' : 'failed'}:\n${result.response}`);
    } catch (error) {
      alert('Provider test failed');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#f5f5f5', padding: '20px', borderRight: '1px solid #ddd' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Chat Agent Platform</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              padding: '10px',
              backgroundColor: activeTab === 'chat' ? '#007bff' : '#fff',
              color: activeTab === 'chat' ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            💬 Chat Demo
          </button>

          <button
            onClick={() => setActiveTab('providers')}
            style={{
              padding: '10px',
              backgroundColor: activeTab === 'providers' ? '#007bff' : '#fff',
              color: activeTab === 'providers' ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🤖 LLM Providers
          </button>

          <button
            onClick={() => setActiveTab('contentstack')}
            style={{
              padding: '10px',
              backgroundColor: activeTab === 'contentstack' ? '#007bff' : '#fff',
              color: activeTab === 'contentstack' ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📚 Contentstack
          </button>

          <button
            onClick={() => setActiveTab('config')}
            style={{
              padding: '10px',
              backgroundColor: activeTab === 'config' ? '#007bff' : '#fff',
              color: activeTab === 'config' ? '#fff' : '#333',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ⚙️ Configuration
          </button>
        </div>

        <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Quick Start</h4>
          <p style={{ margin: '0', fontSize: '12px', lineHeight: '1.4' }}>
            1. Configure your API keys in the backend<br/>
            2. Test LLM providers<br/>
            3. Set up Contentstack connection<br/>
            4. Start chatting with AI-powered responses!
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px' }}>
        {activeTab === 'chat' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3>Chat Demo</h3>
              <p>Test the chat functionality with different providers and Contentstack integration.</p>
            </div>

            {/* Chat Messages */}
            <div style={{
              flex: 1,
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '20px',
              overflowY: 'auto',
              backgroundColor: '#fafafa'
            }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
                  <p>👋 Welcome to the Chat Agent Platform!</p>
                  <p>Start a conversation to see the AI in action.</p>
                  <p style={{ fontSize: '14px', marginTop: '20px' }}>
                    Try asking: "What tours are available for Italy?" to see Contentstack integration.
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} style={{
                    marginBottom: '15px',
                    textAlign: message.role === 'user' ? 'right' : 'left'
                  }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '10px 15px',
                      borderRadius: '15px',
                      backgroundColor: message.role === 'user' ? '#007bff' : '#e9ecef',
                      color: message.role === 'user' ? '#fff' : '#333',
                      maxWidth: '70%'
                    }}>
                      <div>{message.content}</div>
                      {message.metadata && (
                        <div style={{
                          fontSize: '10px',
                          marginTop: '5px',
                          opacity: 0.7
                        }}>
                          {message.metadata.provider} • {message.metadata.model} • {message.metadata.tokens} tokens
                          {message.metadata.contentstackUsed && ' • 📚 Contentstack'}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div style={{ textAlign: 'left', marginBottom: '15px' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '10px 15px',
                    borderRadius: '15px',
                    backgroundColor: '#e9ecef'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#007bff',
                        animation: 'pulse 1s infinite'
                      }}></div>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#007bff',
                        animation: 'pulse 1s infinite 0.2s'
                      }}></div>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#007bff',
                        animation: 'pulse 1s infinite 0.4s'
                      }}></div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div style={{
                  padding: '10px',
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '4px',
                  marginBottom: '15px'
                }}>
                  Error: {error}
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Type your message here..."
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoading) {
                    sendMessage((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
                disabled={isLoading}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (input.value.trim()) {
                    sendMessage(input.value);
                    input.value = '';
                  }
                }}
                disabled={isLoading}
                style={{
                  padding: '12px 20px',
                  backgroundColor: isLoading ? '#ccc' : '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                Send
              </button>
              <button
                onClick={clearMessages}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <div>
            <h3>LLM Providers</h3>
            <p>Manage and test different language model providers.</p>

            <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
              {providers.map((provider) => (
                <div key={provider.id} style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>{provider.name}</h4>
                      <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                        Models: {provider.models.join(', ')}
                      </p>
                      <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                        Default: {provider.defaultModel}
                      </p>
                    </div>
                    <button
                      onClick={() => testProvider(provider.id)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contentstack' && (
          <div>
            <h3>Contentstack Integration</h3>
            <p>Search and manage content from your Contentstack CMS.</p>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
                <button
                  onClick={handleSearchContent}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Search
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              {contentstackResults.map((result, index) => (
                <div key={index} style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: '#fff'
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{result.title}</h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                    <strong>Type:</strong> {result.contentType} |
                    <strong> Relevance:</strong> {result.relevance}
                  </p>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    <pre style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                      {JSON.stringify(result.content, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div>
            <h3>Configuration</h3>
            <p>Configure your Chat Agent Platform settings.</p>

            <div style={{ maxWidth: '600px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h4>Environment Variables</h4>
                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}>
                  <div>OPENAI_API_KEY=your_openai_key</div>
                  <div>GROQ_API_KEY=your_groq_key</div>
                  <div>ANTHROPIC_API_KEY=your_anthropic_key</div>
                  <div>OPENROUTER_API_KEY=your_openrouter_key</div>
                  <div>CONTENTSTACK_API_KEY=your_contentstack_key</div>
                  <div>CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token</div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4>SDK Configuration</h4>
                <pre style={{
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
{`import { ChatAgentProvider } from 'chat-agent-sdk';

<ChatAgentProvider config={{
  apiUrl: 'http://localhost:3006',
  defaultProvider: 'openai',
  contentstackConfig: {
    apiKey: 'your_api_key',
    deliveryToken: 'your_token',
    environment: 'production'
  }
}}>
  <YourApp />
</ChatAgentProvider>`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

// Main App Component with Provider
const App: React.FC = () => {
  return (
    <ChatAgentProvider config={{
      apiUrl: 'http://localhost:3006',
      defaultProvider: 'openai',
      streaming: true
    }}>
      <ChatAgentPlatformDemo />
    </ChatAgentProvider>
  );
};

export default App;
