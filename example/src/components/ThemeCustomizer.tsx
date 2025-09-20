import React, { useState, useEffect } from 'react';
import '../styles/chatbot-design-system-enhanced.css';

interface ThemeCustomizerProps {
  onThemeChange?: (theme: string) => void;
  className?: string;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  onThemeChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('modern');
  const [customColors, setCustomColors] = useState({
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    background: '#ffffff',
    text: '#1e293b'
  });

  const themes = [
    { id: 'modern', name: 'Modern', colors: ['#6366f1', '#8b5cf6', '#ec4899'] },
    { id: 'travel', name: 'Travel', colors: ['#0077b6', '#00a8cc', '#00a8cc'] },
    { id: 'chatgpt', name: 'ChatGPT', colors: ['#10a37f', '#34d399', '#10a37f'] },
    { id: 'amazon', name: 'Amazon', colors: ['#ff9900', '#146eb4', '#ff9900'] },
    { id: 'custom', name: 'Custom', colors: [customColors.primary, customColors.secondary, customColors.accent] }
  ];

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Apply custom theme variables if custom theme is selected
    if (currentTheme === 'custom') {
      document.documentElement.style.setProperty('--chat-primary', customColors.primary);
      document.documentElement.style.setProperty('--chat-secondary', customColors.secondary);
      document.documentElement.style.setProperty('--chat-accent', customColors.accent);
      document.documentElement.style.setProperty('--chat-bg-primary', customColors.background);
      document.documentElement.style.setProperty('--chat-text-primary', customColors.text);
    }

    // Notify parent component of theme change
    if (onThemeChange) {
      onThemeChange(currentTheme);
    }
  }, [currentTheme, customColors, onThemeChange]);

  const handleThemeSelect = (themeId: string) => {
    setCurrentTheme(themeId);
  };

  const handleCustomColorChange = (colorType: string, value: string) => {
    setCustomColors(prev => ({
      ...prev,
      [colorType]: value
    }));
  };

  const resetToDefault = () => {
    setCustomColors({
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#ffffff',
      text: '#1e293b'
    });
  };

  return (
    <div className={`theme-customizer ${className}`}>
      {/* Toggle Button */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle theme customizer"
        title="Customize Theme"
      >
        🎨
      </button>

      {/* Customizer Panel */}
      {isOpen && (
        <div className="theme-customizer-panel">
          <div className="theme-customizer-header">
            <h3>Theme Customizer</h3>
            <button
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close theme customizer"
            >
              ×
            </button>
          </div>

          <div className="theme-customizer-content">
            {/* Theme Selection */}
            <div className="theme-section">
              <h4>Choose Theme</h4>
              <div className="theme-selector">
                {themes.map(theme => (
                  <button
                    key={theme.id}
                    className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                    data-theme={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    title={theme.name}
                    aria-label={`Select ${theme.name} theme`}
                  >
                    <div
                      className="theme-preview"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Picker */}
            {currentTheme === 'custom' && (
              <div className="theme-section">
                <h4>Custom Colors</h4>
                <div className="custom-colors-grid">
                  <div className="color-input-group">
                    <label htmlFor="primary-color">Primary Color</label>
                    <input
                      id="primary-color"
                      type="color"
                      value={customColors.primary}
                      onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                      className="color-picker"
                    />
                  </div>

                  <div className="color-input-group">
                    <label htmlFor="secondary-color">Secondary Color</label>
                    <input
                      id="secondary-color"
                      type="color"
                      value={customColors.secondary}
                      onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                      className="color-picker"
                    />
                  </div>

                  <div className="color-input-group">
                    <label htmlFor="accent-color">Accent Color</label>
                    <input
                      id="accent-color"
                      type="color"
                      value={customColors.accent}
                      onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                      className="color-picker"
                    />
                  </div>

                  <div className="color-input-group">
                    <label htmlFor="background-color">Background</label>
                    <input
                      id="background-color"
                      type="color"
                      value={customColors.background}
                      onChange={(e) => handleCustomColorChange('background', e.target.value)}
                      className="color-picker"
                    />
                  </div>

                  <div className="color-input-group">
                    <label htmlFor="text-color">Text Color</label>
                    <input
                      id="text-color"
                      type="color"
                      value={customColors.text}
                      onChange={(e) => handleCustomColorChange('text', e.target.value)}
                      className="color-picker"
                    />
                  </div>
                </div>

                <button
                  className="reset-button"
                  onClick={resetToDefault}
                  aria-label="Reset to default colors"
                >
                  Reset to Default
                </button>
              </div>
            )}

            {/* Theme Preview */}
            <div className="theme-section">
              <h4>Preview</h4>
              <div className="theme-preview">
                <div className="preview-header" style={{ background: 'var(--chat-primary)' }}>
                  <div className="preview-avatar">🤖</div>
                  <div className="preview-title">Chatbot Preview</div>
                </div>
                <div className="preview-messages">
                  <div className="preview-message bot">
                    Hello! This is how your theme looks.
                  </div>
                  <div className="preview-message user">
                    Great! I love this theme.
                  </div>
                </div>
                <div className="preview-input">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    readOnly
                    value="Type your message..."
                  />
                  <button>Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .theme-customizer {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          font-family: var(--chat-font-family, 'Inter', sans-serif);
        }

        .theme-customizer-panel {
          position: absolute;
          top: 70px;
          right: 0;
          width: 320px;
          max-height: 600px;
          background: var(--chat-bg-primary);
          border: 1px solid var(--chat-border-light);
          border-radius: 12px;
          box-shadow: var(--chat-shadow-xl);
          overflow: hidden;
          animation: chatbotSlideInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .theme-customizer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--chat-border-light);
          background: var(--chat-bg-secondary);
        }

        .theme-customizer-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--chat-text-primary);
        }

        .theme-customizer-content {
          padding: 16px;
          overflow-y: auto;
          max-height: 520px;
        }

        .theme-section {
          margin-bottom: 24px;
        }

        .theme-section h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--chat-text-primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .theme-selector {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .theme-option {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease-out;
          position: relative;
          overflow: hidden;
        }

        .theme-option:hover {
          transform: scale(1.1);
          border-color: var(--chat-primary);
        }

        .theme-option.active {
          border-color: var(--chat-primary);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }

        .theme-preview {
          width: 100%;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--chat-border-light);
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          color: white;
        }

        .preview-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .preview-title {
          font-size: 12px;
          font-weight: 600;
        }

        .preview-messages {
          padding: 12px;
          background: var(--chat-bg-secondary);
          min-height: 80px;
        }

        .preview-message {
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 11px;
          margin-bottom: 8px;
          max-width: 70%;
        }

        .preview-message.bot {
          background: var(--chat-bg-primary);
          border: 1px solid var(--chat-border-light);
          color: var(--chat-text-primary);
        }

        .preview-message.user {
          background: var(--chat-primary);
          color: white;
          margin-left: auto;
        }

        .preview-input {
          display: flex;
          gap: 8px;
          padding: 12px;
          background: var(--chat-bg-input);
          border-top: 1px solid var(--chat-border-light);
        }

        .preview-input input {
          flex: 1;
          padding: 6px 8px;
          border: 1px solid var(--chat-border-light);
          border-radius: 16px;
          font-size: 10px;
          background: var(--chat-bg-primary);
          color: var(--chat-text-primary);
        }

        .preview-input button {
          padding: 6px 12px;
          background: var(--chat-primary);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 10px;
          cursor: pointer;
        }

        .custom-colors-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .color-input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .color-input-group label {
          font-size: 12px;
          color: var(--chat-text-secondary);
          font-weight: 500;
        }

        .color-picker {
          width: 100%;
          height: 36px;
          border: 1px solid var(--chat-border-light);
          border-radius: 6px;
          cursor: pointer;
        }

        .reset-button {
          width: 100%;
          padding: 8px 16px;
          background: var(--chat-bg-secondary);
          border: 1px solid var(--chat-border-light);
          border-radius: 6px;
          color: var(--chat-text-secondary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.15s ease-out;
        }

        .reset-button:hover {
          background: var(--chat-bg-tertiary);
          color: var(--chat-text-primary);
        }

        @media (max-width: 480px) {
          .theme-customizer {
            top: 10px;
            right: 10px;
          }

          .theme-customizer-panel {
            width: calc(100vw - 20px);
            max-width: 320px;
            top: 60px;
            left: 10px;
            right: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default ThemeCustomizer;
