const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Import route modules
const configRoutes = require('./config');
const chatRoutes = require('./chat');
const analyticsRoutes = require('./analytics');

// Use route modules
router.use('/config', configRoutes);
router.use('/chat', chatRoutes);
router.use('/analytics', analyticsRoutes);

// API health check
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Fitment Assistant API',
    version: '1.0.0',
    endpoints: {
      config: '/api/config',
      chat: '/api/chat',
      analytics: '/api/analytics'
    }
  });
});

// Global error handler for API routes
router.use((error, req, res, next) => {
  logger.error('API Error:', error);
  
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = router;
