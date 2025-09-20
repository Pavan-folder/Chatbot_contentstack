import React, { useState, useEffect } from 'react';
import '../styles/chatbot-design-system.css';

interface ConfigData {
  providers: {
    [key: string]: {
      enabled: boolean;
      apiKey: string;
      models: string[];
      defaultModel: string;
      maxTokens: number;
      temperature: number;
      rateLimit: {
        requestsPerMinute: number;
        requestsPerHour: number;
      };
    };
  };
  chat: {
    maxMessages: number;
    maxMessageLength: number;
    enableStreaming: boolean;
    enableLogging: boolean;
    defaultProvider: string;
    fallbackProvider: string;
    systemPrompt: string;
    enableContentSearch: boolean;
    contentSearchLimit: number;
  };
  security: {
    enableCors: boolean;
    allowedOrigins: string[];
    enableRateLimiting: boolean;
    globalRateLimit: {
      requestsPerMinute: number;
      requestsPerHour: number;
    };
    enableApiKeyAuth: boolean;
    apiKeys: string[];
  };
  features: {
    [key: string]: boolean;
  };
  ui: {
    defaultTheme: string;
    availableThemes: string[];
    enableAnimations: boolean;
    enableDarkMode: boolean;
    compactMode: boolean;
  };
}

const AdminPanel: React.FC = () => {
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('providers');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3006/config');
      if (!response.ok) {
        throw new Error('Failed to fetch config');
      }
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<ConfigData>) => {
    if (!config) return;

    try {
      setSaving(true);
      const response = await fetch('http://localhost:3006/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update config');
      }

      setConfig({ ...config, ...updates });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleProviderChange = (provider: string, field: string, value: any) => {
    if (!config) return;

    const updatedConfig = {
      ...config,
      providers: {
        ...config.providers,
        [provider]: {
          ...config.providers[provider],
          [field]: value
        }
      }
    };

    setConfig(updatedConfig);
  };

  const handleChatSettingChange = (field: string, value: any) => {
    if (!config) return;

    setConfig({
      ...config,
      chat: {
        ...config.chat,
        [field]: value
      }
    });
  };

  const handleFeatureToggle = (feature: string, enabled: boolean) => {
    if (!config) return;

    setConfig({
      ...config,
      features: {
        ...config.features,
        [feature]: enabled
      }
    });
  };

  if (loading) {
    return (
      <div className="chatbot-container" style={{ width: '800px', height: '600px' }}>
        <div className="chatbot-header">
          <div className="chatbot-avatar">⚙️</div>
          <div className="chatbot-header-text">
            <h3 className="chatbot-title">Admin Panel</h3>
            <p className="chatbot-subtitle">Loading configuration...</p>
          </div>
        </div>
        <div className="chatbot-messages" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div className="chatbot-loading">
            <span>Loading admin panel</span>
            <div className="chatbot-loading-dots">
              <div className="chatbot-loading-dot"></div>
              <div className="chatbot-loading-dot"></div>
              <div className="chatbot-loading-dot"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="chatbot-container" style={{ width: '800px', height: '600px' }}>
        <div className="chatbot-header">
          <div className="chatbot-avatar">⚙️</div>
          <div className="chatbot-header-text">
            <h3 className="chatbot-title">Admin Panel</h3>
            <p className="chatbot-subtitle">Configuration Error</p>
          </div>
        </div>
        <div className="chatbot-messages" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div style={{ textAlign: 'center', color: 'var(--chat-text-secondary)' }}>
            <p>❌ Error: {error}</p>
            <button
              onClick={fetchConfig}
              style={{
                background: 'var(--chat-primary)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'providers', label: 'LLM Providers', icon: '🤖' },
    { id: 'chat', label: 'Chat Settings', icon: '💬' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'features', label: 'Features', icon: '🚀' },
    { id: 'ui', label: 'UI Settings', icon: '🎨' }
  ];

  return (
    <div className="chatbot-container" style={{ width: '900px', height: '700px' }} data-theme="modern">
      <div className="chatbot-header">
        <div className="chatbot-avatar">⚙️</div>
        <div className="chatbot-header-text">
          <h3 className="chatbot-title">Admin Panel</h3>
          <p className="chatbot-subtitle">Configuration Management</p>
        </div>
        <button
          onClick={() => updateConfig(config)}
          disabled={saving}
          style={{
            background: saving ? 'var(--chat-text-muted)' : 'var(--chat-success)',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {saving ? '💾 Saving...' : '💾 Save Changes'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        background: 'var(--chat-bg-secondary)',
        borderBottom: '1px solid var(--chat-border-light)',
        padding: '0 16px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'var(--chat-primary)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--chat-text-secondary)',
              border: 'none',
              padding: '12px 16px',
              cursor: 'pointer',
              borderRadius: '8px 8px 0 0',
              marginRight: '4px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="chatbot-messages" style={{ padding: '16px', overflowY: 'auto' }}>
        {activeTab === 'providers' && (
          <div>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--chat-text-primary)' }}>LLM Provider Configuration</h4>
            {Object.entries(config.providers).map(([provider, settings]) => (
              <div key={provider} style={{
                background: 'var(--chat-bg-secondary)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--chat-border-light)',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h5 style={{ margin: 0, color: 'var(--chat-text-primary)', textTransform: 'capitalize' }}>
                    {provider} Provider
                  </h5>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={(e) => handleProviderChange(provider, 'enabled', e.target.checked)}
                    />
                    <span style={{ fontSize: '14px', color: 'var(--chat-text-secondary)' }}>Enabled</span>
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--chat-text-secondary)', marginBottom: '4px' }}>
                      API Key
                    </label>
                    <input
                      type="password"
                      value={settings.apiKey}
                      onChange={(e) => handleProviderChange(provider, 'apiKey', e.target.value)}
                      placeholder="Enter API key"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--chat-border-light)',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--chat-text-secondary)', marginBottom: '4px' }}>
                      Default Model
                    </label>
                    <select
                      value={settings.defaultModel}
                      onChange={(e) => handleProviderChange(provider, 'defaultModel', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--chat-border-light)',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      {settings.models.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--chat-text-secondary)', marginBottom: '4px' }}>
                      Temperature
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => handleProviderChange(provider, 'temperature', parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <span style={{ fontSize: '12px', color: 'var(--chat-text-secondary)' }}>
                      {settings.temperature}
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--chat-text-secondary)', marginBottom: '4px' }}>
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={settings.maxTokens}
                      onChange={(e) => handleProviderChange(provider, 'maxTokens', parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--chat-border-light)',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'chat' && (
          <div>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--chat-text-primary)' }}>Chat Configuration</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--chat-text-secondary)', marginBottom: '4px' }}>
                  Max Messages
                </label>
                <input
                  type="number"
                  value={config.chat.maxMessages}
                  onChange={(e) => handleChatSettingChange('maxMessages', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid var(--chat-border-light)',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--chat-text-secondary)', marginBottom: '4px' }}>
                  Max Message Length
                </label>
                <input
                  type="number"
                  value={config.chat.maxMessageLength}
                  onChange={(e) => handleChatSettingChange('maxMessageLength', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid var(--chat-border-light)',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--chat-text-secondary)', marginBottom: '4px' }}>
                  Default Provider
                </label>
                <select
                  value={config.chat.defaultProvider}
                  onChange={(e) => handleChatSettingChange('defaultProvider', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid var(--chat-border-light)',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  {Object.keys(config.providers).map(provider => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--chat-text-secondary)', marginBottom: '4px' }}>
                  Fallback Provider
                </label>
                <select
                  value={config.chat.fallbackProvider}
                  onChange={(e) => handleChatSettingChange('fallbackProvider', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid var(--chat-border-light)',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  {Object.keys(config.providers).map(provider => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--chat-text-secondary)', marginBottom: '4px' }}>
                System Prompt
              </label>
              <textarea
                value={config.chat.systemPrompt}
                onChange={(e) => handleChatSettingChange('systemPrompt', e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid var(--chat-border-light)',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={config.chat.enableStreaming}
                  onChange={(e) => handleChatSettingChange('enableStreaming', e.target.checked)}
                />
                <span style={{ fontSize: '14px', color: 'var(--chat-text-primary)' }}>Enable Streaming</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={config.chat.enableLogging}
                  onChange={(e) => handleChatSettingChange('enableLogging', e.target.checked)}
                />
                <span style={{ fontSize: '14px', color: 'var(--chat-text-primary)' }}>Enable Logging</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={config.chat.enableContentSearch}
                  onChange={(e) => handleChatSettingChange('enableContentSearch', e.target.checked)}
                />
                <span style={{ fontSize: '14px', color: 'var(--chat-text-primary)' }}>Enable Content Search</span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--chat-text-primary)' }}>Feature Flags</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              {Object.entries(config.features).map(([feature, enabled]) => (
                <label key={feature} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'var(--chat-bg-secondary)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--chat-border-light)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleFeatureToggle(feature, e.target.checked)}
                    style={{ transform: 'scale(1.2)' }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--chat-text-primary)' }}>
                      {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--chat-text-secondary)' }}>
                      {getFeatureDescription(feature)}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--chat-text-primary)' }}>Security Settings</h4>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={config.security.enableCors}
                    onChange={(e) => setConfig({
                      ...config,
                      security: { ...config.security, enableCors: e.target.checked }
                    })}
                  />
                  <span style={{ fontSize: '14px', color: 'var(--chat-text-primary)' }}>Enable CORS</span>
                </label>

                {config.security.enableCors && (
                  <textarea
                    value={config.security.allowedOrigins.join('\n')}
                    onChange={(e) => setConfig({
                      ...config,
                      security: {
                        ...config.security,
                        allowedOrigins: e.target.value.split('\n').filter(origin => origin.trim())
                      }
                    })}
                    placeholder="Enter allowed origins, one per line"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid var(--chat-border-light)',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                )}
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={config.security.enableRateLimiting}
                    onChange={(e) => setConfig({
                      ...config,
                      security: { ...config.security, enableRateLimiting: e.target.checked }
                    })}
                  />
                  <span style={{ fontSize: '14px', color: 'var(--chat-text-primary)' }}>Enable Rate Limiting</span>
                </label>

                {config.security.enableRateLimiting && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--chat-text-secondary)', marginBottom: '4px' }}>
                        Requests/Minute
                      </label>
                      <input
                        type="number"
                        value={config.security.globalRateLimit.requestsPerMinute}
                        onChange={(e) => setConfig({
                          ...config,
                          security: {
                            ...config.security,
                            globalRateLimit: {
                              ...config.security.globalRateLimit,
                              requestsPerMinute: parseInt(e.target.value)
                            }
                          }
                        })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid var(--chat-border-light)',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--chat-text-secondary)', marginBottom: '4px' }}>
                        Requests/Hour
                      </label>
                      <input
                        type="number"
                        value={config.security.globalRateLimit.requestsPerHour}
                        onChange={(e) => setConfig({
                          ...config,
                          security: {
                            ...config.security,
                            globalRateLimit: {
                              ...config.security.globalRateLimit,
                              requestsPerHour: parseInt(e.target.value)
                            }
                          }
                        })}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid var(--chat-border-light)',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ui' && (
          <div>
            <h4 style={{ margin: '0 0 16px 0', color: 'var(--chat-text-primary)' }}>UI Configuration</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--chat-text-secondary)', marginBottom: '4px' }}>
                  Default Theme
                </label>
                <select
                  value={config.ui.defaultTheme}
                  onChange={(e) => setConfig({
                    ...config,
                    ui: { ...config.ui, defaultTheme: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid var(--chat-border-light)',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  {config.ui.availableThemes.map(theme => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={config.ui.enableAnimations}
                  onChange={(e) => setConfig({
                    ...config,
                    ui: { ...config.ui, enableAnimations: e.target.checked }
                  })}
                />
                <span style={{ fontSize: '14px', color: 'var(--chat-text-primary)' }}>Enable Animations</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={config.ui.enableDarkMode}
                  onChange={(e) => setConfig({
                    ...config,
                    ui: { ...config.ui, enableDarkMode: e.target.checked }
                  })}
                />
                <span style={{ fontSize: '14px', color: 'var(--chat-text-primary)' }}>Enable Dark Mode</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={config.ui.compactMode}
                  onChange={(e) => setConfig({
                    ...config,
                    ui: { ...config.ui, compactMode: e.target.checked }
                  })}
                />
                <span style={{ fontSize: '14px', color: 'var(--chat-text-primary)' }}>Compact Mode</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getFeatureDescription = (feature: string): string => {
  const descriptions: Record<string, string> = {
    enableFileUploads: 'Allow users to upload files in chat',
    enableVoiceMessages: 'Enable voice message recording and playback',
    enableImageGeneration: 'Allow AI to generate images from text',
    enableWebSearch: 'Enable web search capabilities',
    enableCodeExecution: 'Allow code execution in chat',
    enableMultiLanguage: 'Support multiple languages in interface'
  };
  return descriptions[feature] || 'Feature toggle';
};

export default AdminPanel;
