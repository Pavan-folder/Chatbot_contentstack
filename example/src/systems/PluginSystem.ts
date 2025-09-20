/**
 * ==============================================
 * PLUGIN SYSTEM - EXTENSIBILITY FRAMEWORK
 * ==============================================
 * Advanced plugin architecture for extending
 * chatbot functionality with custom features
 */

interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: string[];
  dependencies: string[];
  entryPoint: string;
  config: Record<string, any>;
}

interface PluginContext {
  chatbot: any;
  user: any;
  config: Record<string, any>;
  api: PluginAPI;
  events: EventEmitter;
}

interface PluginAPI {
  sendMessage: (message: string, options?: any) => void;
  registerCommand: (command: string, handler: Function) => void;
  registerHook: (hook: string, handler: Function) => void;
  getUserData: (key: string) => any;
  setUserData: (key: string, value: any) => void;
  log: (level: string, message: string) => void;
  http: {
    get: (url: string) => Promise<any>;
    post: (url: string, data: any) => Promise<any>;
  };
}

interface PluginInstance {
  manifest: PluginManifest;
  instance: any;
  status: 'loading' | 'active' | 'inactive' | 'error';
  error?: string;
}

interface CommandHandler {
  pluginId: string;
  command: string;
  handler: Function;
  permissions: string[];
}

interface HookHandler {
  pluginId: string;
  hook: string;
  handler: Function;
  priority: number;
}

class EventEmitter {
  private events: Map<string, HookHandler[]> = new Map();

  on(event: string, handler: HookHandler) {
    const handlers = this.events.get(event) || [];
    handlers.push(handler);
    this.events.set(event, handlers);
  }

  emit(event: string, data: any) {
    const handlers = this.events.get(event) || [];
    handlers.sort((a, b) => b.priority - a.priority);

    handlers.forEach(handler => {
      try {
        handler.handler(data);
      } catch (error) {
        console.error(`Plugin error in ${handler.pluginId}:`, error);
      }
    });
  }
}

class PluginManager {
  private plugins: Map<string, PluginInstance> = new Map();
  private commands: Map<string, CommandHandler> = new Map();
  private hooks: Map<string, HookHandler[]> = new Map();
  private eventEmitter: EventEmitter = new EventEmitter();
  private pluginConfigs: Map<string, any> = new Map();

  constructor() {
    this.initializePluginSystem();
  }

  /**
   * Initialize the plugin system
   */
  private async initializePluginSystem() {
    console.log('🔌 Initializing Plugin System...');

    // Load installed plugins
    await this.loadInstalledPlugins();

    // Set up core hooks
    this.setupCoreHooks();

    console.log('✅ Plugin System initialized');
  }

  /**
   * Load installed plugins from storage
   */
  private async loadInstalledPlugins(): Promise<void> {
    try {
      const stored = localStorage.getItem('installedPlugins');
      if (stored) {
        const pluginIds = JSON.parse(stored);
        for (const pluginId of pluginIds) {
          await this.loadPlugin(pluginId);
        }
      }
    } catch (error) {
      console.warn('Failed to load installed plugins:', error);
    }
  }

  /**
   * Install a new plugin
   */
  async installPlugin(manifest: PluginManifest, code: string): Promise<boolean> {
    try {
      console.log(`📦 Installing plugin: ${manifest.name}`);

      // Validate manifest
      if (!this.validateManifest(manifest)) {
        throw new Error('Invalid plugin manifest');
      }

      // Check dependencies
      if (!(await this.checkDependencies(manifest))) {
        throw new Error('Plugin dependencies not satisfied');
      }

      // Create plugin instance
      const pluginInstance = await this.createPluginInstance(manifest, code);

      // Store plugin
      this.plugins.set(manifest.id, pluginInstance);

      // Save to installed plugins
      await this.saveInstalledPlugins();

      // Initialize plugin
      await this.initializePlugin(pluginInstance);

      console.log(`✅ Plugin ${manifest.name} installed successfully`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to install plugin ${manifest.name}:`, error);
      return false;
    }
  }

  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        throw new Error('Plugin not found');
      }

      console.log(`🗑️ Uninstalling plugin: ${plugin.manifest.name}`);

      // Call plugin cleanup
      if (plugin.instance && plugin.instance.onUnload) {
        await plugin.instance.onUnload();
      }

      // Remove plugin
      this.plugins.delete(pluginId);

      // Remove associated commands and hooks
      this.removePluginCommands(pluginId);
      this.removePluginHooks(pluginId);

      // Save to installed plugins
      await this.saveInstalledPlugins();

      console.log(`✅ Plugin ${plugin.manifest.name} uninstalled successfully`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to uninstall plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Enable a plugin
   */
  async enablePlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        throw new Error('Plugin not found');
      }

      if (plugin.status === 'active') {
        return true; // Already active
      }

      console.log(`▶️ Enabling plugin: ${plugin.manifest.name}`);

      // Initialize plugin
      await this.initializePlugin(plugin);

      plugin.status = 'active';
      console.log(`✅ Plugin ${plugin.manifest.name} enabled`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to enable plugin ${pluginId}:`, error);
      plugin.status = 'error';
      plugin.error = error.message;
      return false;
    }
  }

  /**
   * Disable a plugin
   */
  async disablePlugin(pluginId: string): Promise<boolean> {
    try {
      const plugin = this.plugins.get(pluginId);
      if (!plugin) {
        throw new Error('Plugin not found');
      }

      if (plugin.status === 'inactive') {
        return true; // Already inactive
      }

      console.log(`⏸️ Disabling plugin: ${plugin.manifest.name}`);

      // Call plugin cleanup
      if (plugin.instance && plugin.instance.onUnload) {
        await plugin.instance.onUnload();
      }

      plugin.status = 'inactive';
      console.log(`✅ Plugin ${plugin.manifest.name} disabled`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to disable plugin ${pluginId}:`, error);
      return false;
    }
  }

  /**
   * Execute a command
   */
  async executeCommand(command: string, args: any[], context: PluginContext): Promise<any> {
    const commandHandler = this.commands.get(command);
    if (!commandHandler) {
      throw new Error(`Command not found: ${command}`);
    }

    // Check permissions
    if (!(await this.checkPermissions(commandHandler.permissions, context))) {
      throw new Error('Insufficient permissions');
    }

    try {
      return await commandHandler.handler(args, context);
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
      throw error;
    }
  }

  /**
   * Get plugin configuration
   */
  getPluginConfig(pluginId: string): any {
    return this.pluginConfigs.get(pluginId) || {};
  }

  /**
   * Set plugin configuration
   */
  async setPluginConfig(pluginId: string, config: any): Promise<void> {
    this.pluginConfigs.set(pluginId, config);
    await this.savePluginConfigs();
  }

  /**
   * Get all installed plugins
   */
  getInstalledPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin statistics
   */
  getPluginStats(): any {
    const plugins = Array.from(this.plugins.values());
    return {
      total: plugins.length,
      active: plugins.filter(p => p.status === 'active').length,
      inactive: plugins.filter(p => p.status === 'inactive').length,
      error: plugins.filter(p => p.status === 'error').length,
      totalCommands: this.commands.size,
      totalHooks: Array.from(this.hooks.values()).flat().length
    };
  }

  // Private methods

  private async createPluginInstance(manifest: PluginManifest, code: string): Promise<PluginInstance> {
    const pluginInstance: PluginInstance = {
      manifest,
      instance: null,
      status: 'loading'
    };

    try {
      // Create plugin function from code
      const pluginFunction = new Function('context', `
        ${code}
        return { manifest: ${JSON.stringify(manifest)}, instance: typeof PluginClass !== 'undefined' ? new PluginClass(context) : null };
      `);

      const result = pluginFunction(this.createPluginContext(manifest.id));

      if (result && result.instance) {
        pluginInstance.instance = result.instance;
      } else {
        throw new Error('Plugin instance creation failed');
      }

    } catch (error) {
      pluginInstance.status = 'error';
      pluginInstance.error = error.message;
      throw error;
    }

    return pluginInstance;
  }

  private async initializePlugin(plugin: PluginInstance): Promise<void> {
    if (!plugin.instance) {
      throw new Error('Plugin instance not available');
    }

    const context = this.createPluginContext(plugin.manifest.id);

    // Register commands
    if (plugin.instance.registerCommands) {
      await plugin.instance.registerCommands(context);
    }

    // Register hooks
    if (plugin.instance.registerHooks) {
      await plugin.instance.registerHooks(context);
    }

    // Call onLoad
    if (plugin.instance.onLoad) {
      await plugin.instance.onLoad(context);
    }
  }

  private createPluginContext(pluginId: string): PluginContext {
    const context: PluginContext = {
      chatbot: {
        version: '1.0.0',
        features: ['ai-learning', 'theme-customization', 'responsive-design']
      },
      user: {
        id: 'current-user',
        preferences: {},
        permissions: ['basic']
      },
      config: this.getPluginConfig(pluginId),
      api: this.createPluginAPI(pluginId),
      events: this.eventEmitter
    };

    return context;
  }

  private createPluginAPI(pluginId: string): PluginAPI {
    return {
      sendMessage: (message: string, options?: any) => {
        this.eventEmitter.emit('message', { pluginId, message, options });
      },

      registerCommand: (command: string, handler: Function) => {
        this.commands.set(command, {
          pluginId,
          command,
          handler,
          permissions: ['basic']
        });
      },

      registerHook: (hook: string, handler: Function) => {
        this.eventEmitter.on(hook, {
          pluginId,
          hook,
          handler,
          priority: 1
        });
      },

      getUserData: (key: string) => {
        return localStorage.getItem(`plugin_${pluginId}_${key}`);
      },

      setUserData: (key: string, value: any) => {
        localStorage.setItem(`plugin_${pluginId}_${key}`, JSON.stringify(value));
      },

      log: (level: string, message: string) => {
        console[level] ? console[level](`[${pluginId}] ${message}`) : console.log(`[${pluginId}] ${message}`);
      },

      http: {
        get: async (url: string) => {
          const response = await fetch(url);
          return response.json();
        },

        post: async (url: string, data: any) => {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          return response.json();
        }
      }
    };
  }

  private validateManifest(manifest: PluginManifest): boolean {
    return !!(
      manifest.id &&
      manifest.name &&
      manifest.version &&
      manifest.entryPoint &&
      Array.isArray(manifest.permissions) &&
      Array.isArray(manifest.dependencies)
    );
  }

  private async checkDependencies(manifest: PluginManifest): Promise<boolean> {
    // Check if all dependencies are available
    for (const dep of manifest.dependencies) {
      if (!this.isDependencyAvailable(dep)) {
        return false;
      }
    }
    return true;
  }

  private isDependencyAvailable(dependency: string): boolean {
    // Check if dependency is available in the system
    const availableDeps = ['core', 'ui', 'http', 'storage', 'events'];
    return availableDeps.includes(dependency);
  }

  private async checkPermissions(permissions: string[], context: PluginContext): Promise<boolean> {
    // Check if user has required permissions
    const userPermissions = context.user.permissions || [];
    return permissions.every(perm => userPermissions.includes(perm));
  }

  private removePluginCommands(pluginId: string): void {
    for (const [command, handler] of this.commands.entries()) {
      if (handler.pluginId === pluginId) {
        this.commands.delete(command);
      }
    }
  }

  private removePluginHooks(pluginId: string): void {
    for (const [event, handlers] of this.hooks.entries()) {
      const filteredHandlers = handlers.filter(h => h.pluginId !== pluginId);
      this.hooks.set(event, filteredHandlers);
    }
  }

  private setupCoreHooks(): void {
    // Message preprocessing hook
    this.eventEmitter.on('beforeMessage', {
      pluginId: 'core',
      hook: 'beforeMessage',
      handler: (data: any) => {
        // Preprocess messages
      },
      priority: 10
    });

    // Message postprocessing hook
    this.eventEmitter.on('afterMessage', {
      pluginId: 'core',
      hook: 'afterMessage',
      handler: (data: any) => {
        // Postprocess messages
      },
      priority: 10
    });

    // User interaction hook
    this.eventEmitter.on('userInteraction', {
      pluginId: 'core',
      hook: 'userInteraction',
      handler: (data: any) => {
        // Track user interactions
      },
      priority: 10
    });
  }

  private async saveInstalledPlugins(): Promise<void> {
    try {
      const pluginIds = Array.from(this.plugins.keys());
      localStorage.setItem('installedPlugins', JSON.stringify(pluginIds));
    } catch (error) {
      console.warn('Failed to save installed plugins:', error);
    }
  }

  private async savePluginConfigs(): Promise<void> {
    try {
      const configs = Object.fromEntries(this.pluginConfigs);
      localStorage.setItem('pluginConfigs', JSON.stringify(configs));
    } catch (error) {
      console.warn('Failed to save plugin configs:', error);
    }
  }

  private async loadPlugin(pluginId: string): Promise<void> {
    try {
      const stored = localStorage.getItem(`plugin_${pluginId}`);
      if (stored) {
        const data = JSON.parse(stored);
        await this.installPlugin(data.manifest, data.code);
      }
    } catch (error) {
      console.warn(`Failed to load plugin ${pluginId}:`, error);
    }
  }
}

// Example Plugin Template
export const createPluginTemplate = (name: string): string => `
class ${name}Plugin {
  constructor(context) {
    this.context = context;
    this.api = context.api;
  }

  async onLoad(context) {
    this.api.log('info', '${name} plugin loaded');

    // Register commands
    this.api.registerCommand('/${name.toLowerCase()}', this.handleCommand.bind(this));

    // Register hooks
    this.api.registerHook('beforeMessage', this.onBeforeMessage.bind(this));
  }

  async handleCommand(args, context) {
    this.api.sendMessage('Hello from ${name} plugin!');
  }

  async onBeforeMessage(data) {
    // Process messages before they're sent
    this.api.log('info', 'Processing message: ' + data.message);
  }

  async onUnload() {
    this.api.log('info', '${name} plugin unloaded');
  }
}

// Export for plugin system
window.PluginClass = ${name}Plugin;
`;

// Export singleton instance
export const pluginManager = new PluginManager();
export default PluginManager;
