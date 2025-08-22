const express = require('express');
const router = express.Router();
const configService = require('../services/configService');
const { basicAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get tenant configuration (public endpoint for widget)
router.get('/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const config = await configService.getTenantConfig(tenantId);
    
    // Return only necessary data for widget
    const publicConfig = {
      tenantId: config.tenantId,
      brandName: config.brandName,
      logoUrl: config.logoUrl,
      theme: config.theme,
      position: config.position,
      greeting: config.greeting,
      enabled: config.enabled,
      features: config.features
    };
    
    res.json(publicConfig);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    logger.error('Error getting tenant config:', error);
    res.status(500).json({ error: 'Failed to get tenant configuration' });
  }
});

// List all tenants (admin only)
router.get('/', basicAuth, async (req, res) => {
  try {
    const tenants = await configService.listTenants();
    res.json(tenants);
  } catch (error) {
    logger.error('Error listing tenants:', error);
    res.status(500).json({ error: 'Failed to list tenants' });
  }
});

// Create new tenant (admin only)
router.post('/', basicAuth, async (req, res) => {
  try {
    const config = await configService.createTenantConfig(req.body);
    const embedCode = configService.generateEmbedCode(config.tenantId);
    
    res.status(201).json({
      ...config,
      embedCode
    });
  } catch (error) {
    logger.error('Error creating tenant:', error);
    res.status(400).json({ error: error.message || 'Failed to create tenant' });
  }
});

// Update tenant configuration (admin only)
router.put('/:tenantId', basicAuth, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const config = await configService.updateTenantConfig(tenantId, req.body);
    const embedCode = configService.generateEmbedCode(config.tenantId);
    
    res.json({
      ...config,
      embedCode
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    logger.error('Error updating tenant:', error);
    res.status(400).json({ error: error.message || 'Failed to update tenant' });
  }
});

// Delete tenant (admin only)
router.delete('/:tenantId', basicAuth, async (req, res) => {
  try {
    const { tenantId } = req.params;
    await configService.deleteTenantConfig(tenantId);
    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    logger.error('Error deleting tenant:', error);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
});

// Get tenant statistics (admin only)
router.get('/:tenantId/stats', basicAuth, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const stats = await configService.getTenantStats(tenantId);
    res.json(stats);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    logger.error('Error getting tenant stats:', error);
    res.status(500).json({ error: 'Failed to get tenant statistics' });
  }
});

// Generate embed code for tenant (admin only)
router.get('/:tenantId/embed', basicAuth, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const config = await configService.getTenantConfig(tenantId);
    const embedCode = configService.generateEmbedCode(tenantId);
    
    res.json({
      tenantId,
      embedCode,
      instructions: [
        'Copy and paste this code into your website',
        'Place it just before the closing </body> tag',
        'The widget will automatically load and initialize'
      ]
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    logger.error('Error generating embed code:', error);
    res.status(500).json({ error: 'Failed to generate embed code' });
  }
});

module.exports = router;
