// Configuration Provider Pattern - clean và type-safe
export interface AppConfig {
  appId?: string;
  code?: string;
  apiUrl?: string;
  lang?: string;
}

class AppConfigManager {
  private config: AppConfig = {};
  private initialized = false;

  // Initialize config - allow re-initialization for bundle usage
  initialize(config: AppConfig) {
    if (this.initialized) {
      console.warn('AppConfig already initialized, updating config...');
      // Allow updating config for bundle scenarios
      this.config = {...this.config, ...config};
      return;
    }

    this.config = {...config};
    this.initialized = true;
  }

  // Force reset - for bundle re-initialization
  forceInitialize(config: AppConfig) {
    this.config = {...config};
    this.initialized = true;
  }

  // Get full config
  getConfig(): AppConfig {
    return {...this.config};
  }

  // Get credentials only
  getCredentials() {
    return {
      appId: this.config.appId,
      code: this.config.code,
    };
  }

  // Get API URL with fallback
  getApiUrl() {
    return this.config.apiUrl;
  }

  // Get language
  getLang() {
    return this.config.lang;
  }

  // Check if initialized
  isInitialized() {
    return this.initialized;
  }

  // Reset (chỉ dùng cho testing)
  reset() {
    this.config = {};
    this.initialized = false;
  }
}

// Secure singleton using Symbol - không expose lên global scope
const APP_CONFIG_SYMBOL = Symbol.for('@@WMS_APP_CONFIG@@');

class SecureAppConfigManager extends AppConfigManager {
  static getInstance(): AppConfigManager {
    // Sử dụng Symbol thay vì string key để tránh conflicts
    const globalScope = (() => {
      if (typeof globalThis !== 'undefined') return globalThis;
      if (typeof window !== 'undefined') return window;
      if (typeof global !== 'undefined') return global;
      return {} as any;
    })();

    if (!(APP_CONFIG_SYMBOL in globalScope)) {
      globalScope[APP_CONFIG_SYMBOL] = new AppConfigManager();
    }

    return globalScope[APP_CONFIG_SYMBOL];
  }
}

// Export secure singleton instance
export const appConfig = SecureAppConfigManager.getInstance();
