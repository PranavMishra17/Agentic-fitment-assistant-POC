const express = require('express');
const router = express.Router();
const chatService = require('../services/chatService');
const analyticsService = require('../services/analyticsService');
const configService = require('../services/configService');
const { basicAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

// Create new chat session
router.post('/session', async (req, res) => {
  try {
    const { tenantId, sessionId } = req.body;
    
    // Verify tenant exists and is enabled
    const config = await configService.getTenantConfig(tenantId);
    if (!config.enabled) {
      return res.status(403).json({ error: 'Chat widget is disabled for this tenant' });
    }
    
    const session = await chatService.createSession(tenantId, sessionId);
    
    // Track session creation
    await analyticsService.trackEvent({
      eventType: 'session_created',
      tenantId,
      sessionId: session.sessionId,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });
    
    res.status(201).json(session);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    logger.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Get chat session (admin only)
router.get('/session/:sessionId', basicAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await chatService.getSession(sessionId);
    res.json(session);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    logger.error('Error getting chat session:', error);
    res.status(500).json({ error: 'Failed to get chat session' });
  }
});

// Send message in chat session
router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, sender = 'user' } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }
    
    // Log user message
    const userMessage = await chatService.logMessage(sessionId, {
      message,
      sender,
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      }
    });
    
    // Get session to find tenant
    const session = await chatService.getSession(sessionId);
    
    // Track message event
    await analyticsService.trackEvent({
      eventType: 'message_sent',
      tenantId: session.tenantId,
      sessionId,
      data: { sender, messageLength: message.length },
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });
    
    // Generate and log assistant response (only for user messages)
    let assistantMessage = null;
    if (sender === 'user') {
      const response = chatService.generateResponse(message);
      assistantMessage = await chatService.logMessage(sessionId, {
        message: response,
        sender: 'assistant',
        metadata: {
          generatedAt: new Date().toISOString(),
          inResponseTo: userMessage.id
        }
      });
      
      // Track assistant response
      await analyticsService.trackEvent({
        eventType: 'message_sent',
        tenantId: session.tenantId,
        sessionId,
        data: { sender: 'assistant', messageLength: response.length },
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      });
    }
    
    res.json({
      userMessage,
      assistantMessage,
      sessionId
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    logger.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Log custom event in session
router.post('/event', async (req, res) => {
  try {
    const { sessionId, eventType, eventData } = req.body;
    
    if (!sessionId || !eventType) {
      return res.status(400).json({ error: 'sessionId and eventType are required' });
    }
    
    const event = await chatService.logEvent(sessionId, {
      type: eventType,
      data: eventData
    });
    
    // Get session to find tenant for analytics
    const session = await chatService.getSession(sessionId);
    
    // Track in analytics
    await analyticsService.trackEvent({
      eventType,
      tenantId: session.tenantId,
      sessionId,
      data: eventData,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    });
    
    res.json(event);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    logger.error('Error logging event:', error);
    res.status(500).json({ error: 'Failed to log event' });
  }
});

// Get sessions for tenant (admin only)
router.get('/tenant/:tenantId/sessions', basicAuth, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const sessions = await chatService.getSessionsByTenant(tenantId, limit);
    res.json(sessions);
  } catch (error) {
    logger.error('Error getting tenant sessions:', error);
    res.status(500).json({ error: 'Failed to get tenant sessions' });
  }
});

// Get session statistics for tenant (admin only)
router.get('/tenant/:tenantId/stats', basicAuth, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const stats = await chatService.getSessionStats(tenantId);
    res.json(stats);
  } catch (error) {
    logger.error('Error getting session stats:', error);
    res.status(500).json({ error: 'Failed to get session statistics' });
  }
});

module.exports = router;
