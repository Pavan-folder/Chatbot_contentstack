/**
 * ==============================================
 * AI-ENHANCED CHATBOT WITH PLUGIN SYSTEM
 * ==============================================
 * Advanced chatbot component that integrates
 * AI learning and plugin system for enhanced functionality
 */

import React, { useState, useEffect, useRef } from 'react';
import { aiLearningEngine } from '../systems/AILearningSystemFixed';
import { pluginManager, createPluginTemplate } from '../systems/PluginSystem';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  rating?: number;
  context: string[];
}

interface Plugin {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  description: string;
}

const AIEnhancedChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI-enhanced chatbot with learning capabilities and plugin support! 🤖✨",
      sender: 'bot',
      timestamp: new Date(),
      context: ['greeting', 'introduction']
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState('user_' + Math.random().toString(36).substr(2, 9));
  const [showPluginPanel, setShowPluginPanel] = useState(false);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [learningStats, setLearningStats] = useState<any>({});
  const [showStats, setShowStats] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize systems
  useEffect(() => {
    const initializeSystems = async () => {
      try {
        // Initialize plugin system
        await pluginManager.initializePluginSystem();

        // Install example plugins
        await installExamplePlugins();

        // Update plugin list
        updatePluginList();

        // Get initial learning stats
        updateLearningStats();

      } catch (error) {
        console.error('Failed to initialize systems:', error);
      }
    };

    initializeSystems();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const updatePluginList = () => {
    const installedPlugins = pluginManager.getInstalledPlugins();
    const pluginList: Plugin[] = installedPlugins.map(p => ({
      id: p.manifest.id,
      name: p.manifest.name,
      status: p.status,
      description: p.manifest.description
    }));
    setPlugins(pluginList);
  };

  const updateLearningStats = () => {
    const stats = aiLearningEngine.getLearningStats();
    setLearningStats(stats);
  };

  const installExamplePlugins = async () => {
    // Example: Greeting Plugin
    const greetingPluginManifest = {
      id: 'greeting-plugin',
      name: 'Greeting Plugin',
      version: '1.0.0',
      description: 'Enhances greetings and farewells',
      author: 'Chatbot Team',
      permissions: ['basic'],
      dependencies: ['core'],
      entryPoint: 'GreetingPlugin',
      config: {}
    };

    const greetingPluginCode = `
    class GreetingPlugin {
      constructor(context) {
        this.context = context;
        this.api = context.api;
      }

      async onLoad(context) {
        this.api.log('info', 'Greeting plugin loaded');

        // Register greeting command
        this.api.registerCommand('/greet', this.handleGreet.bind(this));
        this.api.registerCommand('/bye', this.handleBye.bind(this));

        // Register message hooks
        this.api.registerHook('beforeMessage', this.onBeforeMessage.bind(this));
      }

      async handleGreet(args, context) {
        const timeOfDay = new Date().getHours();
        let greeting = '';

        if (timeOfDay < 12) greeting = 'Good morning! ';
        else if (timeOfDay < 17) greeting = 'Good afternoon! ';
        else greeting = 'Good evening! ';

        this.api.sendMessage(greeting + 'How can I help you today? 🌅');
      }

      async handleBye(args, context) {
        this.api.sendMessage('Goodbye! Have a wonderful day! 👋');
      }

      async onBeforeMessage(data) {
        // Add greeting context to messages
        if (data.message.toLowerCase().includes('hello') ||
            data.message.toLowerCase().includes('hi')) {
          data.context = data.context || [];
          data.context.push('greeting');
        }
      }

      async onUnload() {
        this.api.log('info', 'Greeting plugin unloaded');
      }
    }

    window.PluginClass = GreetingPlugin;
    `;

    await pluginManager.installPlugin(greetingPluginManifest, greetingPluginCode);

    // Example: Fun Plugin
    const funPluginManifest = {
      id: 'fun-plugin',
      name: 'Fun Plugin',
      version: '1.0.0',
      description: 'Adds fun features and jokes',
      author: 'Chatbot Team',
      permissions: ['basic'],
      dependencies: ['core'],
      entryPoint: 'FunPlugin',
      config: {}
    };

    const funPluginCode = `
    class FunPlugin {
      constructor(context) {
        this.context = context;
        this.api = context;
        this.jokes = [
          "Why don't scientists trust atoms? Because they make up everything! ⚛️",
          "What do you call fake spaghetti? An impasta! 🍝",
          "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾"
        ];
      }

      async onLoad(context) {
        this.api.log('info', 'Fun plugin loaded');

        // Register fun commands
        this.api.registerCommand('/joke', this.handleJoke.bind(this));
        this.api.registerCommand('/funfact', this.handleFunFact.bind(this));
        this.api.registerCommand('/magic', this.handleMagic.bind(this));
      }

      async handleJoke(args, context) {
        const randomJoke = this.jokes[Math.floor(Math.random() * this.jokes.length)];
        this.api.sendMessage(randomJoke);
      }

      async handleFunFact(args, context) {
        const facts = [
          "A group of flamingos is called a 'flamboyance'! 🦩",
          "Bananas are berries, but strawberries aren't! 🍌🍓",
          "Octopuses have three hearts! 🐙❤️❤️❤️"
        ];
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        this.api.sendMessage("Fun fact: " + randomFact);
      }

      async handleMagic(args, context) {
        const tricks = [
          "🎩 Poof! Your message has been enchanted! ✨",
          "🔮 I see great things in your future... like more chatting! 💬",
          "🧙‍♂️ Abracadabra! Something magical happened! 🌟"
        ];
        const randomTrick = tricks[Math.floor(Math.random() * tricks.length)];
        this.api.sendMessage(randomTrick);
      }

      async onUnload() {
        this.api.log('info', 'Fun plugin unloaded');
      }
    }

    window.PluginClass = FunPlugin;
    `;

    await pluginManager.installPlugin(funPluginManifest, funPluginCode);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      context: ['user_input']
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Check for plugin commands
      if (inputValue.startsWith('/')) {
        await handlePluginCommand(inputValue);
      } else {
        // Generate AI response with learning
        const context = ['general_chat'];
        const response = await aiLearningEngine.generateImprovedResponse(
          userId,
          inputValue,
          context
        );

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'bot',
          timestamp: new Date(),
          context: context
        };

        setMessages(prev => [...prev, botMessage]);

        // Record interaction for learning
        await aiLearningEngine.recordInteraction({
          userId,
          message: inputValue,
          response: response,
          context: context,
          sentiment: 'neutral',
          responseTime: Date.now() - userMessage.timestamp.getTime()
        });

        updateLearningStats();
      }

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again! 😅",
        sender: 'bot',
        timestamp: new Date(),
        context: ['error']
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handlePluginCommand = async (command: string) => {
    try {
      const context = {
        chatbot: { version: '1.0.0' },
        user: { id: userId, permissions: ['basic'] },
        config: {},
        api: pluginManager.createPluginAPI('command-handler'),
        events: pluginManager['eventEmitter']
      };

      await pluginManager.executeCommand(command, [], context);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Plugin command "${command}" not found. Type /help for available commands! 🤔`,
        sender: 'bot',
        timestamp: new Date(),
        context: ['plugin_error']
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const rateMessage = async (messageId: string, rating: number) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, rating } : msg
    ));

    // Record rating for AI learning
    const message = messages.find(m => m.id === messageId);
    if (message && message.sender === 'bot') {
      await aiLearningEngine.recordInteraction({
        userId,
        message: message.text,
        response: message.text,
        rating,
        context: message.context,
        sentiment: rating > 3 ? 'positive' : rating < 3 ? 'negative' : 'neutral',
        responseTime: 100
      });

      updateLearningStats();
    }
  };

  const togglePlugin = async (pluginId: string) => {
    const plugin = plugins.find(p => p.id === pluginId);
    if (!plugin) return;

    if (plugin.status === 'active') {
      await pluginManager.disablePlugin(pluginId);
    } else {
      await pluginManager.enablePlugin(pluginId);
    }

    updatePluginList();
  };

  const resetAILearning = async () => {
    await aiLearningEngine.resetLearningData();
    updateLearningStats();
    const resetMessage: Message = {
      id: Date.now().toString(),
      text: "AI learning data has been reset! I'll start learning from scratch. 🧹",
      sender: 'bot',
      timestamp: new Date(),
      context: ['system']
    };
    setMessages(prev => [...prev, resetMessage]);
  };

  return (
    <div className="ai-enhanced-chatbot">
      <div className="chatbot-header">
        <div className="chatbot-title">
          <h3>🤖 AI-Enhanced Chatbot</h3>
          <p>With Learning & Plugin System</p>
        </div>
        <div className="chatbot-controls">
          <button
            className="control-btn"
            onClick={() => setShowStats(!showStats)}
            title="Show AI Learning Stats"
          >
            📊
          </button>
          <button
            className="control-btn"
            onClick={() => setShowPluginPanel(!showPluginPanel)}
            title="Show Plugin Panel"
          >
            🔌
          </button>
        </div>
      </div>

      {/* AI Learning Stats Panel */}
      {showStats && (
        <div className="stats-panel">
          <h4>🧠 AI Learning Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{learningStats.totalInteractions || 0}</span>
              <span className="stat-label">Interactions</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{learningStats.totalPatterns || 0}</span>
              <span className="stat-label">Patterns</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{learningStats.totalUsers || 0}</span>
              <span className="stat-label">Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {learningStats.averageSatisfaction ?
                  (learningStats.averageSatisfaction * 100).toFixed(0) + '%' : '0%'}
              </span>
              <span className="stat-label">Satisfaction</span>
            </div>
          </div>
          <button className="reset-btn" onClick={resetAILearning}>
            Reset Learning Data
          </button>
        </div>
      )}

      {/* Plugin Management Panel */}
      {showPluginPanel && (
        <div className="plugin-panel">
          <h4>🔌 Plugin Management</h4>
          <div className="plugin-list">
            {plugins.map(plugin => (
              <div key={plugin.id} className="plugin-item">
                <div className="plugin-info">
                  <h5>{plugin.name}</h5>
                  <p>{plugin.description}</p>
                  <span className={`plugin-status ${plugin.status}`}>
                    {plugin.status}
                  </span>
                </div>
                <button
                  className="plugin-toggle"
                  onClick={() => togglePlugin(plugin.id)}
                >
                  {plugin.status === 'active' ? 'Disable' : 'Enable'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="chatbot-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.sender}`}>
            <div className="message-bubble">
              <p>{message.text}</p>
              <div className="message-meta">
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                {message.sender === 'bot' && (
                  <div className="rating-controls">
                    <button onClick={() => rateMessage(message.id, 1)}>😞</button>
                    <button onClick={() => rateMessage(message.id, 3)}>😐</button>
                    <button onClick={() => rateMessage(message.id, 5)}>😊</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message bot">
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chatbot-input-area">
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or use /greet, /joke, /funfact..."
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? '⏳' : 'Send'}
          </button>
        </div>
        <div className="input-hints">
          <span>💡 Try: /greet, /joke, /funfact, /magic</span>
        </div>
      </div>
    </div>
  );
};

export default AIEnhancedChatbot;
