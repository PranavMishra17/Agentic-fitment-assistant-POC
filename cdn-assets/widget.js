/**
 * Fitment Assistant Widget Loader
 * Main entry point for the chat widget
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    CDN_BASE_URL: 'https://cdn-fitment.pages.dev',
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
      link.onerror = () => console.error('[Fitment Widget] CSS failed to load');
      document.head.appendChild(link);
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

      // Use sendBeacon if available, fallback to fetch
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(eventData)], { type: 'application/json' });
        navigator.sendBeacon(`${CONFIG.API_BASE_URL}/analytics/event`, blob);
      } else {
        fetch(`${CONFIG.API_BASE_URL}/analytics/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData)
        }).catch(error => {
          console.warn('[Fitment Widget] Analytics tracking failed:', error);
        });
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
