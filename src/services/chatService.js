const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const SESSIONS_DIR = path.join(process.cwd(), 'data/sessions');

class ChatService {
  constructor() {
    this.ensureDirectoryExists();
  }

  async ensureDirectoryExists() {
    try {
      await fs.access(SESSIONS_DIR);
    } catch {
      await fs.mkdir(SESSIONS_DIR, { recursive: true });
      logger.info('Created sessions directory');
    }
  }

  async createSession(tenantId, sessionId = null) {
    const id = sessionId || `sess-${uuidv4()}`;
    const timestamp = new Date().toISOString();

    const session = {
      sessionId: id,
      tenantId,
      messages: [],
      events: [],
      metadata: {
        messageCount: 0,
        firstMessageAt: null,
        lastMessageAt: null,
        userAgent: null,
        ipAddress: null
      },
      createdAt: timestamp,
      updatedAt: timestamp
    };

    try {
      const sessionPath = path.join(SESSIONS_DIR, `${id}.json`);
      await fs.writeFile(sessionPath, JSON.stringify(session, null, 2));
      logger.info(`Created chat session: ${id} for tenant: ${tenantId}`);
      return session;
    } catch (error) {
      logger.error('Error creating chat session:', error);
      throw error;
    }
  }

  async getSession(sessionId) {
    try {
      const sessionPath = path.join(SESSIONS_DIR, `${sessionId}.json`);
      const data = await fs.readFile(sessionPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Session ${sessionId} not found`);
      }
      logger.error('Error reading session:', error);
      throw error;
    }
  }

  async logMessage(sessionId, messageData) {
    try {
      const session = await this.getSession(sessionId);
      const messageId = `msg-${uuidv4()}`;
      const timestamp = new Date().toISOString();

      const message = {
        id: messageId,
        message: messageData.message,
        sender: messageData.sender, // 'user' or 'assistant'
        timestamp,
        metadata: messageData.metadata || {}
      };

      session.messages.push(message);
      session.metadata.messageCount = session.messages.length;
      session.metadata.lastMessageAt = timestamp;
      
      if (!session.metadata.firstMessageAt) {
        session.metadata.firstMessageAt = timestamp;
      }

      session.updatedAt = timestamp;

      const sessionPath = path.join(SESSIONS_DIR, `${sessionId}.json`);
      await fs.writeFile(sessionPath, JSON.stringify(session, null, 2));
      
      logger.info(`Logged message in session ${sessionId}: ${messageData.sender}`);
      return message;
    } catch (error) {
      logger.error('Error logging message:', error);
      throw error;
    }
  }

  async logEvent(sessionId, eventData) {
    try {
      const session = await this.getSession(sessionId);
      const eventId = `evt-${uuidv4()}`;
      const timestamp = new Date().toISOString();

      const event = {
        id: eventId,
        type: eventData.type,
        data: eventData.data || {},
        timestamp
      };

      session.events.push(event);
      session.updatedAt = timestamp;

      const sessionPath = path.join(SESSIONS_DIR, `${sessionId}.json`);
      await fs.writeFile(sessionPath, JSON.stringify(session, null, 2));
      
      logger.info(`Logged event in session ${sessionId}: ${eventData.type}`);
      return event;
    } catch (error) {
      logger.error('Error logging event:', error);
      throw error;
    }
  }

  async getSessionsByTenant(tenantId, limit = 50) {
    try {
      const files = await fs.readdir(SESSIONS_DIR);
      const sessions = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const sessionId = file.replace('.json', '');
            const session = await this.getSession(sessionId);
            
            if (session.tenantId === tenantId) {
              sessions.push(session);
            }
          } catch (error) {
            logger.warn(`Error reading session file ${file}:`, error.message);
          }
        }
      }

      return sessions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
    } catch (error) {
      logger.error('Error getting sessions by tenant:', error);
      throw error;
    }
  }

  async getSessionStats(tenantId) {
    try {
      const sessions = await this.getSessionsByTenant(tenantId, 1000); // Get more for stats
      
      const totalSessions = sessions.length;
      const totalMessages = sessions.reduce((sum, session) => sum + session.metadata.messageCount, 0);
      const avgMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;
      
      const lastActivity = sessions.length > 0 
        ? sessions[0].updatedAt 
        : null;

      return {
        tenantId,
        totalSessions,
        totalMessages,
        avgMessagesPerSession: Math.round(avgMessagesPerSession * 100) / 100,
        lastActivity
      };
    } catch (error) {
      logger.error('Error getting session stats:', error);
      throw error;
    }
  }

  // Hardcoded responses for POC
  generateResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Vehicle fitment responses
    if (message.includes('bmw') || message.includes('beemer')) {
      return "Great choice! For BMW vehicles, we typically recommend wheels with a 5x120 bolt pattern. What's your specific model and year? I can help you find the perfect fitment with proper offset and sizing.";
    }
    
    if (message.includes('honda') || message.includes('civic') || message.includes('accord')) {
      return "Honda vehicles usually use a 5x114.3 bolt pattern. For Civics, we often recommend 16-18 inch wheels, while Accords can handle 17-19 inch wheels beautifully. What's your budget range?";
    }
    
    if (message.includes('ford') || message.includes('mustang') || message.includes('f150')) {
      return "Ford has different bolt patterns depending on the model. Mustangs use 5x114.3, while F-150s use 6x135. What Ford model are you looking to outfit?";
    }
    
    if (message.includes('tire') || message.includes('tyre')) {
      return "For tire recommendations, I'll need to know your wheel size and driving style. Are you looking for all-season, performance, or off-road tires? What's your current tire size?";
    }
    
    if (message.includes('offset') || message.includes('et')) {
      return "Offset is crucial for proper fitment! It affects how the wheel sits in relation to your fender and suspension. Too aggressive an offset can cause rubbing or clearance issues. What vehicle are you working with?";
    }
    
    if (message.includes('size') || message.includes('diameter')) {
      return "Wheel sizing depends on your vehicle and desired look. We can usually go +1 or +2 inches from stock diameter while maintaining proper tire sidewall height. What's your current wheel size?";
    }
    
    if (message.includes('price') || message.includes('cost') || message.includes('budget')) {
      return "Our wheels range from $150-$800 per wheel depending on size, brand, and finish. We have great options at every price point. What's your target budget per wheel?";
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm here to help you find the perfect wheels and tires for your vehicle. What car are you looking to upgrade?";
    }
    
    if (message.includes('help')) {
      return "I can help you with wheel fitment, tire sizing, bolt patterns, offsets, and recommendations for your specific vehicle. Just tell me what you're driving and what you're looking for!";
    }
    
    // Default response
    return "I'd be happy to help with your fitment needs! Could you tell me more about your vehicle (make, model, year) and what you're looking for? I can assist with wheel sizing, bolt patterns, offsets, and tire recommendations.";
  }
}

module.exports = new ChatService();
