const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const { basicAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

// Track event (public endpoint for widget)
router.post('/event', async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip
    };
    
    if (!eventData.eventType || !eventData.tenantId) {
      return res.status(400).json({ error: 'eventType and tenantId are required' });
    }
    
    const event = await analyticsService.trackEvent(eventData);
    res.json({ success: true, eventId: event.timestamp });
  } catch (error) {
    logger.error('Error tracking event:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Get tenant overview (admin only)
router.get('/tenant/:tenantId/overview', basicAuth, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const dateRange = parseInt(req.query.days) || 7;
    
    const overview = await analyticsService.getTenantOverview(tenantId, dateRange);
    res.json(overview);
  } catch (error) {
    logger.error('Error getting tenant overview:', error);
    res.status(500).json({ error: 'Failed to get tenant overview' });
  }
});

// Get daily metrics (admin only)
router.get('/tenant/:tenantId/metrics', basicAuth, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const days = parseInt(req.query.days) || 30;
    
    const metrics = await analyticsService.getDailyMetrics(tenantId, days);
    res.json(metrics);
  } catch (error) {
    logger.error('Error getting daily metrics:', error);
    res.status(500).json({ error: 'Failed to get daily metrics' });
  }
});

// Generate analytics report (admin only)
router.get('/tenant/:tenantId/report', basicAuth, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const dateRange = parseInt(req.query.days) || 30;
    
    const report = await analyticsService.generateReport(tenantId, dateRange);
    
    // Set headers for file download if requested
    if (req.query.download === 'true') {
      const filename = `analytics_${tenantId}_${new Date().toISOString().split('T')[0]}.json`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/json');
    }
    
    res.json(report);
  } catch (error) {
    logger.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Get event types summary (admin only)
router.get('/tenant/:tenantId/events', basicAuth, async (req, res) => {
  try {
    const { tenantId } = req.params;
    const days = parseInt(req.query.days) || 7;
    
    const overview = await analyticsService.getTenantOverview(tenantId, days);
    
    const eventSummary = {
      tenantId,
      period: `${days} days`,
      eventTypes: overview.eventTypes,
      totalEvents: overview.totalEvents,
      uniqueSessions: overview.uniqueSessions
    };
    
    res.json(eventSummary);
  } catch (error) {
    logger.error('Error getting event types:', error);
    res.status(500).json({ error: 'Failed to get event types' });
  }
});

// Cleanup old events (admin only)
router.post('/cleanup', basicAuth, async (req, res) => {
  try {
    const daysToKeep = parseInt(req.body.daysToKeep) || 90;
    const result = await analyticsService.cleanupOldEvents(daysToKeep);
    
    res.json({
      success: true,
      message: `Cleaned up ${result.cleanedFiles} old analytics files`,
      cutoffDate: result.cutoffDate
    });
  } catch (error) {
    logger.error('Error cleaning up events:', error);
    res.status(500).json({ error: 'Failed to cleanup old events' });
  }
});

// Get analytics status (admin only)
router.get('/status', basicAuth, async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    const analyticsDir = path.join(process.cwd(), 'data/analytics');
    const files = await fs.readdir(analyticsDir);
    
    const fileStats = await Promise.all(
      files.filter(f => f.endsWith('.jsonl')).map(async (file) => {
        const filePath = path.join(analyticsDir, file);
        const stats = await fs.stat(filePath);
        const content = await fs.readFile(filePath, 'utf8');
        const eventCount = content.trim().split('\n').filter(line => line).length;
        
        return {
          filename: file,
          size: stats.size,
          eventCount,
          lastModified: stats.mtime
        };
      })
    );
    
    res.json({
      status: 'ok',
      totalFiles: fileStats.length,
      totalEvents: fileStats.reduce((sum, f) => sum + f.eventCount, 0),
      totalSize: fileStats.reduce((sum, f) => sum + f.size, 0),
      files: fileStats.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
    });
  } catch (error) {
    logger.error('Error getting analytics status:', error);
    res.status(500).json({ error: 'Failed to get analytics status' });
  }
});

module.exports = router;
