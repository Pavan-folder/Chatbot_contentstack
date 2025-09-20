const OpenAI = require('openai');
const Groq = require('groq-sdk');
const Anthropic = require('@anthropic-ai/sdk');

class LLMService {
  constructor() {
    this.providers = {};
    this.supportedProviders = {
      openai: {
        name: 'OpenAI',
        models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        defaultModel: 'gpt-3.5-turbo',
        streaming: true
      },
      groq: {
        name: 'Groq',
        models: ['llama2-70b-4096', 'mixtral-8x7b-32768', 'gemma-7b-it'],
        defaultModel: 'llama2-70b-4096',
        streaming: true
      },
      anthropic: {
        name: 'Anthropic',
        models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
        defaultModel: 'claude-3-haiku-20240307',
        streaming: true
      },
      openrouter: {
        name: 'OpenRouter',
        models: ['auto', 'openai/gpt-4', 'anthropic/claude-3-opus'],
        defaultModel: 'auto',
        streaming: true
      }
    };
  }

  getProvider(provider) {
    if (!this.providers[provider]) {
      switch (provider) {
        case 'openai':
          this.providers[provider] = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy'
          });
          break;
        case 'groq':
          this.providers[provider] = new Groq({
            apiKey: process.env.GROQ_API_KEY || 'dummy'
          });
          break;
        case 'anthropic':
          this.providers[provider] = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY || 'dummy'
          });
          break;
        case 'openrouter':
          this.providers[provider] = new OpenAI({
            apiKey: process.env.OPENROUTER_API_KEY || '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',
            baseURL: 'https://openrouter.ai/api/v1'
          });
          break;
      }
    }
    return this.providers[provider];
  }

  async generateResponse(provider, messages, options = {}) {
    const { stream = false, model = null, contentstackData = null } = options;

    // Add Contentstack context to the messages if available
    let enhancedMessages = [...messages];
    if (contentstackData && contentstackData.length > 0) {
      const contextMessage = {
        role: 'system',
        content: `You have access to the following content from the knowledge base:\n\n${JSON.stringify(contentstackData, null, 2)}\n\nUse this information to provide accurate and helpful responses. If the content doesn't contain relevant information for the user's query, you can use your general knowledge but mention that the specific content wasn't found.`
      };
      enhancedMessages = [contextMessage, ...enhancedMessages];
    }

    switch (provider) {
      case 'openai':
        return this._callOpenAI(enhancedMessages, stream, model);
      case 'groq':
        return this._callGroq(enhancedMessages, stream, model);
      case 'anthropic':
        return this._callAnthropic(enhancedMessages, stream, model);
      case 'openrouter':
        return this._callOpenRouter(enhancedMessages, stream, model);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async _callOpenAI(messages, stream, model = null) {
    const provider = this.getProvider('openai');
    const response = await provider.chat.completions.create({
      model: model || this.supportedProviders.openai.defaultModel,
      messages,
      stream,
      temperature: 0.7,
      max_tokens: 1000
    });

    if (stream) {
      return response;
    } else {
      return response.choices[0].message.content;
    }
  }

  async _callGroq(messages, stream, model = null) {
    const provider = this.getProvider('groq');
    const response = await provider.chat.completions.create({
      model: model || this.supportedProviders.groq.defaultModel,
      messages,
      stream,
      temperature: 0.7,
      max_tokens: 1000
    });

    if (stream) {
      return response;
    } else {
      return response.choices[0].message.content;
    }
  }

  async _callAnthropic(messages, stream, model = null) {
    const provider = this.getProvider('anthropic');

    // Convert OpenAI format to Anthropic format
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await provider.messages.create({
      model: model || this.supportedProviders.anthropic.defaultModel,
      system: systemMessage?.content || '',
      messages: userMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      })),
      stream,
      temperature: 0.7,
      max_tokens: 1000
    });

    if (stream) {
      return response;
    } else {
      return response.content[0].text;
    }
  }

  async _callOpenRouter(messages, stream, model = null) {
    const provider = this.getProvider('openrouter');
    const response = await provider.chat.completions.create({
      model: model || this.supportedProviders.openrouter.defaultModel,
      messages,
      stream,
      temperature: 0.7,
      max_tokens: 1000
    });

    if (stream) {
      return response;
    } else {
      return response.choices[0].message.content;
    }
  }

  // Get available providers and their configurations
  getAvailableProviders() {
    return Object.keys(this.supportedProviders).map(key => ({
      id: key,
      name: this.supportedProviders[key].name,
      models: this.supportedProviders[key].models,
      defaultModel: this.supportedProviders[key].defaultModel,
      streaming: this.supportedProviders[key].streaming
    }));
  }

  // Check if a provider is configured (has valid API key)
  isProviderConfigured(provider) {
    const apiKey = this._getApiKeyForProvider(provider);
    return apiKey && apiKey !== 'dummy';
  }

  _getApiKeyForProvider(provider) {
    switch (provider) {
      case 'openai':
        return process.env.OPENAI_API_KEY;
      case 'groq':
        return process.env.GROQ_API_KEY;
      case 'anthropic':
        return process.env.ANTHROPIC_API_KEY;
      case 'openrouter':
        return process.env.OPENROUTER_API_KEY;
      default:
        return null;
    }
  }

  // Get configured providers only
  getConfiguredProviders() {
    return this.getAvailableProviders().filter(provider =>
      this.isProviderConfigured(provider.id)
    );
  }
}

module.exports = new LLMService();
