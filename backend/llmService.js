const OpenAI = require('openai');
const Groq = require('groq-sdk');

class LLMService {
  constructor() {
    this.providers = {};
  }

  getProvider(provider) {
    if (!this.providers[provider]) {
      switch (provider) {
        case 'openai':
          this.providers[provider] = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'dummy' });
          break;
        case 'groq':
          this.providers[provider] = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy' });
          break;
        case 'openrouter':
          this.providers[provider] = new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY || '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' });
          break;
      }
    }
    return this.providers[provider];
  }

  async generateResponse(provider, messages, options = {}) {
    const { stream = false } = options;

    switch (provider) {
      case 'openai':
        return this._callOpenAI(messages, stream);
      case 'groq':
        return this._callGroq(messages, stream);
      case 'openrouter':
        return this._callOpenRouter(messages, stream);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async _callOpenAI(messages, stream) {
    const provider = this.getProvider('openai');
    const response = await provider.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      stream,
    });

    if (stream) {
      return response;
    } else {
      return response.choices[0].message.content;
    }
  }

  async _callGroq(messages, stream) {
    const provider = this.getProvider('groq');
    const response = await provider.chat.completions.create({
      model: 'gemma2-9b-it',
      messages,
      stream,
    });

    if (stream) {
      return response;
    } else {
      return response.choices[0].message.content;
    }
  }

  async _callOpenRouter(messages, stream) {
    const provider = this.getProvider('openrouter');
    const response = await provider.chat.completions.create({
      model: 'openrouter-gpt4',
      messages,
      stream,
    });

    if (stream) {
      return response;
    } else {
      return response.choices[0].message.content;
    }
  }
}

module.exports = new LLMService();
