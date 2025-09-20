import React from 'react';
import { ChatAgentProvider } from '../sdk/src/ChatAgentSDKFixed';
import ChatAgentPlatformDemo from './components/ChatAgentPlatformDemo';

const App: React.FC = () => {
  return (
    <ChatAgentProvider config={{
      apiUrl: 'http://localhost:3006',
      defaultProvider: 'openai',
      streaming: true,
      contentstackConfig: {
        apiKey: process.env.REACT_APP_CONTENTSTACK_API_KEY || 'dummy',
        deliveryToken: process.env.REACT_APP_CONTENTSTACK_DELIVERY_TOKEN || 'dummy',
        environment: 'production'
      }
    }}>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <ChatAgentPlatformDemo />
      </div>
    </ChatAgentProvider>
  );
};

export default App;
