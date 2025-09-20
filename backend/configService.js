const fs = require('fs').promises;
const path = require('path');

class ConfigService {
  constructor() {
    this.configFile = path.join(__dirname, 'config.json');
    this.initializeConfig();
  }

  async initializeConfig() {
    try {
      await fs.access(this.configFile);
    } catch (error) {
      // Create initial config file if it doesn't exist
      const initialConfig = {
        // LLM Provider Settings
        providers: {
          openai: {
            enabled: true,
            apiKey: process.env.OPENAI_API_KEY || '',
            models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
            defaultModel: 'gpt-3.5-turbo',
            maxTokens: 4096,
            temperature: 0.7,
            rateLimit: {
              requestsPerMinute: 60,
              requestsPerHour: 1000
            }
          },
          groq: {
            enabled: true,
            apiKey: process.env.GROQ_API_KEY || '',
            models: ['llama2-70b-4096', 'mixtral-8x7b-32768', 'gemma-7b-it'],
            defaultModel: 'llama2-70b-4096',
            maxTokens: 4096,
            temperature: 0.7,
            rateLimit: {
              requestsPerMinute: 30,
              requestsPerHour: 500
            }
          },
          anthropic: {
            enabled: false, // Disabled by default (paid)
            apiKey: process.env.ANTHROPIC_API_KEY || '',
            models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
            defaultModel: 'claude-3-sonnet',
            maxTokens: 4096,
            temperature: 0.7,
            rateLimit: {
              requestsPerMinute: 50,
              requestsPerHour: 1000
            }
          }
        },

        // Contentstack Settings
        contentstack: {
          apiKey: process.env.CONTENTSTACK_API_KEY || '',
          deliveryToken: process.env.CONTENTSTACK_DELIVERY_TOKEN || '',
          environment: process.env.CONTENTSTACK_ENVIRONMENT || 'production',
          region: process.env.CONTENTSTACK_REGION || 'us',
          contentTypes: [],
          cacheTimeout: 300, // 5 minutes
          maxRetries: 3
        },

        // Chat Settings
        chat: {
          maxMessages: 50,
          maxMessageLength: 2000,
          enableStreaming: true,
          enableLogging: true,
          defaultProvider: 'groq',
          fallbackProvider: 'openai',
          systemPrompt: 'You are a helpful AI assistant. Provide clear, concise, and helpful responses.',
          enableContentSearch: true,
          contentSearchLimit: 5
        },

        // Security Settings
        security: {
          enableCors: true,
          allowedOrigins: ['http://localhost:3000', 'http://localhost:3001'],
          enableRateLimiting: true,
          globalRateLimit: {
            requestsPerMinute: 100,
            requestsPerHour: 1000
          },
          enableApiKeyAuth: false,
          apiKeys: []
        },

        // Analytics Settings
        analytics: {
          enabled: true,
          trackRequests: true,
          trackErrors: true,
          trackPerformance: true,
          retentionDays: 30,
          anonymizeIps: true
        },

        // Feature Flags
        features: {
          enableFileUploads: false,
          enableVoiceMessages: false,
          enableImageGeneration: false,
          enableWebSearch: false,
          enableCodeExecution: false,
          enableMultiLanguage: false
        },

        // UI Settings
        ui: {
          defaultTheme: 'modern',
          availableThemes: ['modern', 'travel', 'chatgpt', 'amazon'],
          enableAnimations: true,
          enableDarkMode: true,
          compactMode: false
        }
      };
      await this.saveConfig(initialConfig);
    }
  }

  async saveConfig(config) {
    try {
      await fs.writeFile(this.configFile, JSON.stringify(config, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving config:', error);
      return false;
    }
  }

  async loadConfig() {
    try {
      const data = await fs.readFile(this.configFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading config:', error);
      return null;
    }
  }

  async getConfig() {
    return await this.loadConfig();
  }

  async updateConfig(updates) {
    const config = await this.loadConfig();
    if (!config) return false;

    const updatedConfig = this.deepMerge(config, updates);
    return await this.saveConfig(updatedConfig);
  }

  async getProviderConfig(provider) {
    const config = await this.loadConfig();
    return config?.providers?.[provider] || null;
  }

  async updateProviderConfig(provider, updates) {
    const config = await this.loadConfig();
    if (!config?.providers?.[provider]) return false;

    config.providers[provider] = { ...config.providers[provider], ...updates };
    return await this.saveConfig(config);
  }

  async getFeatureFlag(flag) {
    const config = await this.loadConfig();
    return config?.features?.[flag] || false;
  }

  async setFeatureFlag(flag, enabled) {
    const config = await this.loadConfig();
    if (!config?.features) return false;

    config.features[flag] = enabled;
    return await this.saveConfig(config);
  }

  async getChatSettings() {
    const config = await this.loadConfig();
    return config?.chat || {};
  }

  async updateChatSettings(updates) {
    return await this.updateConfig({ chat: updates });
  }

  async getSecuritySettings() {
    const config = await this.loadConfig();
    return config?.security || {};
  }

  async updateSecuritySettings(updates) {
    return await this.updateConfig({ security: updates });
  }

  async getUISettings() {
    const config = await this.loadConfig();
    return config?.ui || {};
  }

  async updateUISettings(updates) {
    return await this.updateConfig({ ui: updates });
  }

  async resetToDefaults() {
    // This would reset to initial config
    await this.initializeConfig();
    return true;
  }

  async exportConfig() {
    const config = await this.loadConfig();
    if (!config) return null;

    // Remove sensitive data before export
    const exportConfig = { ...config };
    Object.keys(exportConfig.providers).forEach(provider => {
      if (exportConfig.providers[provider].apiKey) {
        exportConfig.providers[provider].apiKey = '***';
      }
    });

    return exportConfig;
  }

  async importConfig(configData) {
    try {
      // Validate config structure
      if (!configData.providers || !configData.chat) {
        throw new Error('Invalid config structure');
      }

      // Merge with existing config, preserving API keys
      const currentConfig = await this.loadConfig();
      if (currentConfig) {
        Object.keys(configData.providers).forEach(provider => {
          if (configData.providers[provider].apiKey === '***') {
            configData.providers[provider].apiKey = currentConfig.providers[provider]?.apiKey || '';
          }
        });
      }

      return await this.saveConfig(configData);
    } catch (error) {
      console.error('Error importing config:', error);
      return false;
    }
  }

  // Utility function for deep merging objects
  deepMerge(target, source) {
    const result = { ...target };
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    });
    return result;
  }
}

module.exports = new ConfigService();
