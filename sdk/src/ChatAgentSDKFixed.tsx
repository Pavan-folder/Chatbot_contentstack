import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import axios, { AxiosInstance } from 'axios';

// Types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    provider?: string;
    model?: string;
    contentstackUsed?: boolean;
    contentstackEntries?: number;
  };
}

export interface ChatAgentConfig {
  apiUrl: string;
  apiKey?: string;
  defaultProvider?: 'openai' | 'groq' | 'anthropic' | 'openrouter';
  defaultModel?: string;
  contentstackConfig?: {
    apiKey: string;
    deliveryToken: string;
    environment?: string;
    stackAlias?: string;
    contentTypes?: string[];
  };
  streaming?: boolean;
  maxRetries?: number;
  timeout?: number;
}

export interface ProviderInfo {
  id: string;
  name: string;
  models: string[];
  defaultModel: string;
  streaming: boolean;
}

export interface ContentstackEntry {
  id: string;
  title: string;
  contentType: string;
  content: any;
  relevance: number;
  url?: string;
}

export interface ChatResponse {
  message: Message;
  provider: string;
  model: string;
  tokens: number;
  responseTime: number;
  contentstackUsed: boolean;
  contentstackEntries: number;
}

export interface ChatAgentSDK {
  // Core chat functionality
  sendMessage: (content: string, options?: Partial<ChatAgentConfig>) => Promise<ChatResponse>;
  sendMessageStream: (content: string, onChunk?: (chunk: string) => void, options?: Partial<ChatAgentConfig>) => Promise<ChatResponse>;

  // Provider management
  getProviders: () => Promise<ProviderInfo[]>;
  getConfiguredProviders: () => Promise<ProviderInfo[]>;
  testProvider: (provider: string, model?: string) => Promise<{ success: boolean; response: string }>;

  // Contentstack integration
  searchContent: (query: string, contentTypes?: string[], limit?: number) => Promise<ContentstackEntry[]>;

  // Configuration
  updateConfig: (config: Partial<ChatAgentConfig>) => void;
  getConfig: () => ChatAgentConfig;

  // Utilities
  abortCurrentRequest: () => void;
  getStats: () => Promise<any>;
}

// Context for React integration
const ChatAgentContext = createContext<ChatAgentSDK | null>(null);

export const useChatAgent = () => {
  const context = useContext(ChatAgentContext);
  if (!context) {
    throw new Error('useChatAgent must be used within a ChatAgentProvider');
  }
  return context;
};

// Main SDK Class
class ChatAgentSDKImpl implements ChatAgentSDK {
  private config: ChatAgentConfig;
  private axiosInstance: AxiosInstance;
  private currentRequestController: AbortController | null = null;

  constructor(config: ChatAgentConfig) {
    this.config = { ...config };
    this.axiosInstance = axios.create({
      baseURL: config.apiUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
      },
    });

    // Add request interceptor for authentication
    this.axiosInstance.interceptors.request.use((config) => {
      if (this.config.apiKey) {
        config.headers.Authorization = `Bearer ${this.config.apiKey}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.error('Authentication failed. Please check your API key.');
        }
        throw error;
      }
    );
  }

  updateConfig(config: Partial<ChatAgentConfig>) {
    this.config = { ...this.config, ...config };
    if (config.apiKey) {
      this.axiosInstance.defaults.headers.Authorization = `Bearer ${config.apiKey}`;
    }
  }

  getConfig() {
    return { ...this.config };
  }

  async sendMessage(content: string, options?: Partial<ChatAgentConfig>): Promise<ChatResponse> {
    const config = { ...this.config, ...options };
    const messages: Message[] = [
      {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      }
    ];

    try {
      const response = await this.axiosInstance.post('/chat', {
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        provider: config.defaultProvider,
        model: config.defaultModel,
        stream: false,
        contentstackConfig: config.contentstackConfig,
      });

      return {
        message: {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.content || response.data.message || 'No response content',
          timestamp: new Date(),
          metadata: {
            tokens: response.data.totalTokens || 0,
            provider: response.data.provider || config.defaultProvider,
            model: response.data.model || config.defaultModel,
            contentstackUsed: response.data.contentstackUsed || false,
            contentstackEntries: response.data.contentstackEntries || 0,
          }
        },
        provider: response.data.provider || config.defaultProvider,
        model: response.data.model || config.defaultModel,
        tokens: response.data.totalTokens || 0,
        responseTime: parseInt(response.data.responseTime) || 0,
        contentstackUsed: response.data.contentstackUsed || false,
        contentstackEntries: response.data.contentstackEntries || 0,
      };
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      throw new Error(`Failed to send message: ${error.response?.data?.error || errorMessage}`);
    }
  }

  async sendMessageStream(
    content: string,
    onChunk?: (chunk: string) => void,
    options?: Partial<ChatAgentConfig>
  ): Promise<ChatResponse> {
    const config = { ...this.config, ...options };
    const messages: Message[] = [
      {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      }
    ];

    // Create abort controller for this request
    this.currentRequestController = new AbortController();

    try {
      const response = await fetch(`${config.apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` }),
        },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          provider: config.defaultProvider,
          model: config.defaultModel,
          stream: true,
          contentstackConfig: config.contentstackConfig,
        }),
        signal: this.currentRequestController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let responseData: any = {};

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                onChunk?.(parsed.content);
              }
              if (parsed.done) {
                responseData = parsed;
              }
            } catch (e) {
              // Ignore parsing errors for non-JSON lines
            }
          }
        }
      }

      return {
        message: {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullContent,
          timestamp: new Date(),
          metadata: {
            tokens: responseData.totalTokens || 0,
            provider: responseData.provider || config.defaultProvider,
            model: responseData.model || config.defaultModel,
            contentstackUsed: responseData.contentstackUsed || false,
            contentstackEntries: responseData.contentstackEntries || 0,
          }
        },
        provider: responseData.provider || config.defaultProvider,
        model: responseData.model || config.defaultModel,
        tokens: responseData.totalTokens || 0,
        responseTime: parseInt(responseData.responseTime) || 0,
        contentstackUsed: responseData.contentstackUsed || false,
        contentstackEntries: responseData.contentstackEntries || 0,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error('Error in streaming:', error);
      }
      throw error;
    } finally {
      this.currentRequestController = null;
    }
  }

  async getProviders(): Promise<ProviderInfo[]> {
    try {
      const response = await this.axiosInstance.get('/providers');
      return response.data.providers || [];
    } catch (error: any) {
      console.error('Error fetching providers:', error);
      return [];
    }
  }

  async getConfiguredProviders(): Promise<ProviderInfo[]> {
    try {
      const response = await this.axiosInstance.get('/providers');
      return response.data.configuredProviders || [];
    } catch (error: any) {
      console.error('Error fetching configured providers:', error);
      return [];
    }
  }

  async testProvider(provider: string, model?: string): Promise<{ success: boolean; response: string }> {
    try {
      const response = await this.axiosInstance.post('/test-provider', {
        provider,
        model,
      });
      return {
        success: true,
        response: response.data.response,
      };
    } catch (error: any) {
      return {
        success: false,
        response: error.response?.data?.error || error.message || 'Unknown error',
      };
    }
  }

  async searchContent(query: string, contentTypes?: string[], limit = 5): Promise<ContentstackEntry[]> {
    try {
      const response = await this.axiosInstance.post('/search-content', {
        query,
        contentTypes,
        limit,
      });
      return response.data.results || [];
    } catch (error: any) {
      console.error('Error searching content:', error);
      return [];
    }
  }

  abortCurrentRequest() {
    if (this.currentRequestController) {
      this.currentRequestController.abort();
    }
  }

  async getStats() {
    try {
      const response = await this.axiosInstance.get('/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      return null;
    }
  }
}

// React Provider Component
export const ChatAgentProvider: React.FC<{ config: ChatAgentConfig; children: React.ReactNode }> = ({
  config,
  children
}) => {
  const [sdk] = useState(() => new ChatAgentSDKImpl(config));

  return (
    <ChatAgentContext.Provider value={sdk}>
      {children}
    </ChatAgentContext.Provider>
  );
};

// React Hook for easy chat functionality
export const useChatAgentSDK = (initialConfig?: Partial<ChatAgentConfig>) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sdk = useChatAgent();

  // Update SDK config if initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      sdk.updateConfig(initialConfig);
    }
  }, [initialConfig, sdk]);

  const sendMessage = useCallback(async (
    content: string,
    options?: {
      stream?: boolean;
      onChunk?: (chunk: string) => void;
      config?: Partial<ChatAgentConfig>;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      let response: ChatResponse;

      if (options?.stream && options.onChunk) {
        response = await sdk.sendMessageStream(content, options.onChunk, options.config);
      } else {
        response = await sdk.sendMessage(content, options?.config);
      }

      const newMessage: Message = {
        id: response.message.id,
        role: response.message.role,
        content: response.message.content,
        timestamp: response.message.timestamp,
        metadata: response.message.metadata,
      };

      setMessages(prev => [...prev, newMessage]);
      return response;
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sdk]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const retryLastMessage = useCallback(async () => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      // Remove the last assistant message if it exists
      setMessages(prev => prev.filter(m => m.role !== 'assistant'));
      return sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
    sdk,
  };
};

export default ChatAgentSDKImpl;
