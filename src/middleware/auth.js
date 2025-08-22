const logger = require('../utils/logger');

// Basic authentication middleware for admin routes
const basicAuth = (req, res, next) => {
  // Skip auth in development for easier testing
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const auth = req.headers.authorization;
  
  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const credentials = Buffer.from(auth.slice(6), 'base64').toString().split(':');
    const [username, password] = credentials;

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'demo123';

    if (username === adminUsername && password === adminPassword) {
      logger.info('Admin authentication successful', { username });
      return next();
    }

    logger.warn('Admin authentication failed', { username });
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

module.exports = { basicAuth };
