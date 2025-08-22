/**
 * Fitment Assistant Chat Widget
 * Interactive chat interface for automotive fitment assistance
 */

(function() {
  'use strict';

  class WheelPriceChatWidget {
    constructor() {
      this.config = null;
      this.apiConfig = null;
      this.sessionId = null;
      this.isOpen = false;
      this.isInitialized = false;
      this.messageCount = 0;
      this.container = null;
      this.chatMessages = null;
      this.messageInput = null;
    }

    init(config, apiConfig) {
      this.config = config;
      this.apiConfig = apiConfig;
      this.sessionId = this.generateSessionId();
      
      console.log('[Chat Widget] Initializing with config:', this.config.tenantId);
      
      this.createWidget();
      this.createSession();
      this.bindEvents();
      this.trackEvent('widget_initialized');
      
      this.isInitialized = true;
    }

    generateSessionId() {
      return 'sess-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    createWidget() {
      // Create main container
      this.container = document.createElement('div');
      this.container.className = 'fitment-widget';
      this.container.setAttribute('data-tenant', this.config.tenantId);
      
      // Apply position
      this.container.classList.add(`position-${this.config.position || 'bottom-right'}`);
      
      // Create widget HTML
      this.container.innerHTML = this.getWidgetHTML();
      
      // Apply theme
      this.applyTheme();
      
      // Add to page
      document.body.appendChild(this.container);
      
      // Get references to elements
      this.chatMessages = this.container.querySelector('.chat-messages');
      this.messageInput = this.container.querySelector('.message-input');
      
      console.log('[Chat Widget] Widget created and added to page');
    }

    getWidgetHTML() {
      return `
        <!-- Chat Button -->
        <div class="chat-button" id="fitment-chat-button">
          <div class="chat-button-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="currentColor"/>
              <path d="M7 9H17V11H7V9ZM7 12H15V14H7V12Z" fill="currentColor"/>
            </svg>
          </div>
          <div class="chat-button-text">Need Help?</div>
        </div>

        <!-- Chat Window -->
        <div class="chat-window" id="fitment-chat-window" style="display: none;">
          <!-- Header -->
          <div class="chat-header">
            <div class="chat-brand">
              ${this.config.logoUrl ? `<img src="${this.config.logoUrl}" alt="${this.config.brandName}" class="brand-logo">` : ''}
              <span class="brand-name">${this.config.brandName}</span>
            </div>
            <button class="chat-close" id="fitment-chat-close">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <!-- Messages -->
          <div class="chat-messages" id="fitment-chat-messages">
            <div class="message assistant">
              <div class="message-content">
                <div class="message-text">${this.config.greeting}</div>
                <div class="message-time">${this.formatTime(new Date())}</div>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="chat-input">
            <div class="input-container">
              <input type="text" class="message-input" placeholder="Ask about wheel fitment..." maxlength="500">
              <button class="send-button" id="fitment-send-button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 1L1 8L4.5 9.5L6 14L9 7L15 1Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div class="input-footer">
              <small>Powered by Fitment Assistant</small>
            </div>
          </div>
        </div>
      `;
    }

    applyTheme() {
      const theme = this.config.theme;
      if (!theme) return;

      const style = document.createElement('style');
      style.textContent = `
        .fitment-widget {
          --primary-color: ${theme.primaryColor || '#007bff'};
          --secondary-color: ${theme.secondaryColor || '#6c757d'};
          --font-family: ${theme.fontFamily || 'Arial, sans-serif'};
          --border-radius: ${theme.borderRadius || '8px'};
        }
      `;
      document.head.appendChild(style);
    }

    bindEvents() {
      const chatButton = this.container.querySelector('#fitment-chat-button');
      const chatClose = this.container.querySelector('#fitment-chat-close');
      const sendButton = this.container.querySelector('#fitment-send-button');
      const messageInput = this.container.querySelector('.message-input');

      // Toggle chat
      chatButton.addEventListener('click', () => this.toggleChat());
      chatClose.addEventListener('click', () => this.closeChat());

      // Send message
      sendButton.addEventListener('click', () => this.sendMessage());
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Track input focus
      messageInput.addEventListener('focus', () => {
        this.trackEvent('input_focused');
      });
    }

    toggleChat() {
      if (this.isOpen) {
        this.closeChat();
      } else {
        this.openChat();
      }
    }

    openChat() {
      const chatWindow = this.container.querySelector('#fitment-chat-window');
      const chatButton = this.container.querySelector('#fitment-chat-button');
      
      chatWindow.style.display = 'block';
      chatButton.style.display = 'none';
      this.isOpen = true;
      
      // Focus input
      setTimeout(() => {
        this.messageInput?.focus();
      }, 100);
      
      this.trackEvent('chat_opened');
    }

    closeChat() {
      const chatWindow = this.container.querySelector('#fitment-chat-window');
      const chatButton = this.container.querySelector('#fitment-chat-button');
      
      chatWindow.style.display = 'none';
      chatButton.style.display = 'flex';
      this.isOpen = false;
      
      this.trackEvent('chat_closed');
    }

    async sendMessage() {
      const message = this.messageInput.value.trim();
      if (!message) return;

      // Clear input
      this.messageInput.value = '';
      
      // Add user message to UI
      this.addMessage(message, 'user');
      
      // Show typing indicator
      this.showTypingIndicator();
      
      try {
        // Send to API
        const response = await fetch(`${this.apiConfig.API_BASE_URL}/chat/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            message: message,
            sender: 'user'
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        // Remove typing indicator
        this.hideTypingIndicator();
        
        // Add assistant response
        if (data.assistantMessage) {
          this.addMessage(data.assistantMessage.message, 'assistant');
        }
        
      } catch (error) {
        console.error('[Chat Widget] Error sending message:', error);
        this.hideTypingIndicator();
        this.addMessage('Sorry, I\'m having trouble connecting. Please try again later.', 'assistant', true);
      }
    }

    addMessage(text, sender, isError = false) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${sender}${isError ? ' error' : ''}`;
      
      messageDiv.innerHTML = `
        <div class="message-content">
          <div class="message-text">${this.escapeHtml(text)}</div>
          <div class="message-time">${this.formatTime(new Date())}</div>
        </div>
      `;
      
      this.chatMessages.appendChild(messageDiv);
      this.scrollToBottom();
      this.messageCount++;
    }

    showTypingIndicator() {
      const typingDiv = document.createElement('div');
      typingDiv.className = 'message assistant typing';
      typingDiv.id = 'typing-indicator';
      
      typingDiv.innerHTML = `
        <div class="message-content">
          <div class="typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      `;
      
      this.chatMessages.appendChild(typingDiv);
      this.scrollToBottom();
    }

    hideTypingIndicator() {
      const typingIndicator = document.getElementById('typing-indicator');
      if (typingIndicator) {
        typingIndicator.remove();
      }
    }

    scrollToBottom() {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    formatTime(date) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    async createSession() {
      try {
        const response = await fetch(`${this.apiConfig.API_BASE_URL}/chat/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: this.config.tenantId,
            sessionId: this.sessionId
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        console.log('[Chat Widget] Session created:', this.sessionId);
      } catch (error) {
        console.error('[Chat Widget] Error creating session:', error);
      }
    }

    trackEvent(eventType, data = {}) {
      if (window.FitmentWidgetDebug?.AnalyticsHelper) {
        window.FitmentWidgetDebug.AnalyticsHelper.trackEvent(eventType, this.config.tenantId, {
          sessionId: this.sessionId,
          messageCount: this.messageCount,
          isOpen: this.isOpen,
          ...data
        });
      }
    }
  }

  // Export to global scope
  window.WheelPriceChatWidget = new WheelPriceChatWidget();

})();
