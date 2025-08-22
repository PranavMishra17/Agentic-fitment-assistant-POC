/**
 * Fitment Assistant Widget Loader
 * Main entry point for the chat widget
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    CDN_BASE_URL: 'https://fitment-assistant-wheelprice.pages.dev',
    API_BASE_URL: 'http://localhost:3000/api', // Will be updated for production
    WIDGET_VERSION: '1.0.0'
  };

  // Widget Initializer
  class WidgetInitializer {
    constructor() {
      this.tenantId = null;
      this.config = null;
      this.initialized = false;
    }

    init() {
      // Get tenant ID from script tag
      const scriptTag = document.currentScript || this.findScriptTag();
      if (!scriptTag) {
        console.error('[Fitment Widget] Could not find widget script tag');
        return;
      }

      this.tenantId = scriptTag.getAttribute('data-tenant');
      if (!this.tenantId) {
        console.error('[Fitment Widget] Missing data-tenant attribute');
        return;
      }

      console.log(`[Fitment Widget] Initializing for tenant: ${this.tenantId}`);
      this.loadTenantConfig();
    }

    findScriptTag() {
      const scripts = document.querySelectorAll('script[data-tenant]');
      return scripts[scripts.length - 1]; // Get the last one
    }

    async loadTenantConfig() {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/config/${this.tenantId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        this.config = await response.json();
        
        if (!this.config.enabled) {
          console.log('[Fitment Widget] Widget is disabled for this tenant');
          return;
        }

        console.log('[Fitment Widget] Config loaded successfully');
        this.loadChatWidget();
      } catch (error) {
        console.error('[Fitment Widget] Failed to load tenant config:', error);
        this.showError('Configuration could not be loaded');
      }
    }

    loadChatWidget() {
      // Load CSS first
      this.loadCSS(`${CONFIG.CDN_BASE_URL}/widget.css`);
      
      // Load chat widget script
      this.loadScript(`${CONFIG.CDN_BASE_URL}/chat-widget.js`, () => {
        if (window.WheelPriceChatWidget) {
          window.WheelPriceChatWidget.init(this.config, CONFIG);
          this.initialized = true;
        } else {
          console.error('[Fitment Widget] Chat widget failed to load');
          this.showError('Widget could not be initialized');
        }
      });
    }

    loadCSS(href) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = href;
      link.onload = () => console.log('[Fitment Widget] CSS loaded');
      link.onerror = () => {
        console.warn('[Fitment Widget] CSS failed to load from CDN, using fallback styles');
        this.loadFallbackCSS();
      };
      document.head.appendChild(link);
    }

    loadFallbackCSS() {
      const style = document.createElement('style');
      style.textContent = `
        .fitment-widget{--primary-color:#007bff;--secondary-color:#6c757d;--font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;--border-radius:8px;--text-color:#333;--bg-color:#ffffff;--border-color:#e1e5e9;--shadow:0 4px 20px rgba(0,0,0,0.15);--shadow-hover:0 6px 25px rgba(0,0,0,0.2);font-family:var(--font-family);position:fixed;z-index:10000;font-size:14px;line-height:1.4}
        .fitment-widget.position-bottom-right{bottom:20px;right:20px}
        .chat-button{display:flex;align-items:center;gap:8px;background:linear-gradient(145deg,var(--primary-color),color-mix(in srgb,var(--primary-color) 85%,black));color:white;padding:18px 24px;border-radius:50px;cursor:pointer;box-shadow:0 8px 32px rgba(0,0,0,0.15),0 4px 16px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.2);transition:all 0.4s cubic-bezier(0.34,1.56,0.64,1);user-select:none;min-width:60px;justify-content:center;font-weight:600;font-size:15px;border:1px solid rgba(255,255,255,0.2);backdrop-filter:blur(10px);position:relative;overflow:hidden}
        .chat-button:hover{transform:translateY(-4px) scale(1.05);box-shadow:0 16px 48px rgba(0,0,0,0.2),0 8px 24px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.3)}
        .chat-window{width:400px;height:550px;background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);border-radius:24px;box-shadow:0 20px 60px rgba(0,0,0,0.15),0 8px 32px rgba(0,0,0,0.1),inset 0 1px 0 rgba(255,255,255,0.8),0 0 0 1px rgba(255,255,255,0.3);display:flex;flex-direction:column;overflow:hidden;animation:cloudFloat 0.6s cubic-bezier(0.34,1.56,0.64,1);border:1px solid rgba(255,255,255,0.4);position:relative}
        @keyframes cloudFloat{0%{opacity:0;transform:translateY(30px) scale(0.9);filter:blur(5px)}50%{transform:translateY(-5px) scale(1.02)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0px)}}
        .chat-header{background:var(--primary-color);color:white;padding:16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
        .chat-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}
        .message{display:flex;margin-bottom:8px}
        .message.user{justify-content:flex-end}
        .message.assistant{justify-content:flex-start}
        .message-content{max-width:80%;position:relative}
        .message-text{padding:10px 14px;border-radius:18px;word-wrap:break-word;white-space:pre-wrap}
        .message.user .message-text{background:var(--primary-color);color:white;border-bottom-right-radius:6px}
        .message.assistant .message-text{background:#f1f3f5;color:var(--text-color);border-bottom-left-radius:6px}
        .chat-input{border-top:1px solid var(--border-color);padding:12px 16px;flex-shrink:0;background:var(--bg-color)}
        .input-container{display:flex;gap:8px;align-items:center}
        .message-input{flex:1;border:1px solid var(--border-color);border-radius:20px;padding:10px 16px;font-size:14px;font-family:var(--font-family);outline:none;transition:border-color 0.2s}
        .send-button{background:var(--primary-color);color:white;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;flex-shrink:0}
      `;
      document.head.appendChild(style);
      console.log('[Fitment Widget] Fallback CSS loaded');
    }

    loadScript(src, callback) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;
      script.onload = callback;
      script.onerror = () => {
        console.error('[Fitment Widget] Script failed to load:', src);
        this.showError('Widget scripts could not be loaded');
      };
      document.head.appendChild(script);
    }

    showError(message) {
      // Create a simple error notification
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 12px 16px;
        border-radius: 4px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 10000;
        max-width: 300px;
      `;
      errorDiv.textContent = `Fitment Widget Error: ${message}`;
      document.body.appendChild(errorDiv);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 5000);
    }
  }

  // Analytics Helper
  class AnalyticsHelper {
    static trackEvent(eventType, tenantId, data = {}) {
      if (!tenantId) return;

      const eventData = {
        eventType,
        tenantId,
        timestamp: new Date().toISOString(),
        data,
        url: window.location.href,
        referrer: document.referrer
      };

      // Try multiple methods to avoid ad blocker issues
      this.attemptTracking(eventData);
    }

    static attemptTracking(eventData) {
      // Method 1: Try sendBeacon first
      if (navigator.sendBeacon) {
        try {
          const blob = new Blob([JSON.stringify(eventData)], { type: 'application/json' });
          const success = navigator.sendBeacon(`${CONFIG.API_BASE_URL}/analytics/event`, blob);
          if (success) {
            console.log('[Fitment Widget] Analytics tracked via sendBeacon');
            return;
          }
        } catch (e) {
          console.warn('[Fitment Widget] sendBeacon failed:', e.message);
        }
      }

      // Method 2: Try fetch
      fetch(`${CONFIG.API_BASE_URL}/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      }).then(response => {
        if (response.ok) {
          console.log('[Fitment Widget] Analytics tracked via fetch');
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      }).catch(error => {
        console.warn('[Fitment Widget] Analytics tracking blocked or failed:', error.message);
        // Method 3: Store locally as fallback
        this.storeLocallyForLater(eventData);
      });
    }

    static storeLocallyForLater(eventData) {
      try {
        const stored = JSON.parse(localStorage.getItem('fitment_widget_events') || '[]');
        stored.push(eventData);
        // Keep only last 50 events
        if (stored.length > 50) stored.splice(0, stored.length - 50);
        localStorage.setItem('fitment_widget_events', JSON.stringify(stored));
        console.log('[Fitment Widget] Event stored locally (analytics blocked)');
      } catch (e) {
        console.warn('[Fitment Widget] Could not store event locally:', e.message);
      }
    }
  }

  // Initialize when DOM is ready
  function initWidget() {
    const initializer = new WidgetInitializer();
    initializer.init();

    // Track widget load
    if (initializer.tenantId) {
      AnalyticsHelper.trackEvent('widget_loaded', initializer.tenantId, {
        version: CONFIG.WIDGET_VERSION,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      });
    }
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

  // Export for debugging
  window.FitmentWidgetDebug = {
    CONFIG,
    AnalyticsHelper,
    version: CONFIG.WIDGET_VERSION
  };

})();
