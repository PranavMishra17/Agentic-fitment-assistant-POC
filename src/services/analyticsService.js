const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

const ANALYTICS_DIR = path.join(process.cwd(), 'data/analytics');

class AnalyticsService {
  constructor() {
    this.ensureDirectoryExists();
  }

  async ensureDirectoryExists() {
    try {
      await fs.access(ANALYTICS_DIR);
    } catch {
      await fs.mkdir(ANALYTICS_DIR, { recursive: true });
      logger.info('Created analytics directory');
    }
  }

  async trackEvent(eventData) {
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0]; // YYYY-MM-DD
    
    const event = {
      eventType: eventData.eventType,
      tenantId: eventData.tenantId,
      sessionId: eventData.sessionId || null,
      timestamp,
      data: eventData.data || {},
      userAgent: eventData.userAgent || null,
      ipAddress: eventData.ipAddress || null
    };

    try {
      const filename = `${eventData.tenantId}_${date}.jsonl`;
      const filePath = path.join(ANALYTICS_DIR, filename);
      
      // Append to JSONL file (one JSON object per line)
      await fs.appendFile(filePath, JSON.stringify(event) + '\n');
      
      logger.info(`Tracked event: ${eventData.eventType} for tenant: ${eventData.tenantId}`);
      return event;
    } catch (error) {
      logger.error('Error tracking event:', error);
      throw error;
    }
  }

  async getTenantOverview(tenantId, dateRange = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - dateRange);

      const events = await this.getEventsInDateRange(tenantId, startDate, endDate);
      
      const overview = {
        tenantId,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        totalEvents: events.length,
        uniqueSessions: new Set(events.map(e => e.sessionId).filter(Boolean)).size,
        eventTypes: this.aggregateEventTypes(events),
        dailyBreakdown: this.getDailyBreakdown(events, startDate, endDate)
      };

      return overview;
    } catch (error) {
      logger.error('Error getting tenant overview:', error);
      throw error;
    }
  }

  async getEventsInDateRange(tenantId, startDate, endDate) {
    const events = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const filename = `${tenantId}_${dateStr}.jsonl`;
      const filePath = path.join(ANALYTICS_DIR, filename);

      try {
        const data = await fs.readFile(filePath, 'utf8');
        const lines = data.trim().split('\n').filter(line => line);
        
        for (const line of lines) {
          try {
            const event = JSON.parse(line);
            events.push(event);
          } catch (parseError) {
            logger.warn(`Error parsing event line in ${filename}:`, parseError.message);
          }
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          logger.warn(`Error reading analytics file ${filename}:`, error.message);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return events;
  }

  aggregateEventTypes(events) {
    const types = {};
    events.forEach(event => {
      types[event.eventType] = (types[event.eventType] || 0) + 1;
    });
    return types;
  }

  getDailyBreakdown(events, startDate, endDate) {
    const daily = {};
    const currentDate = new Date(startDate);

    // Initialize all dates with 0
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      daily[dateStr] = {
        date: dateStr,
        totalEvents: 0,
        uniqueSessions: new Set(),
        eventTypes: {}
      };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate events by date
    events.forEach(event => {
      const eventDate = event.timestamp.split('T')[0];
      if (daily[eventDate]) {
        daily[eventDate].totalEvents++;
        if (event.sessionId) {
          daily[eventDate].uniqueSessions.add(event.sessionId);
        }
        daily[eventDate].eventTypes[event.eventType] = 
          (daily[eventDate].eventTypes[event.eventType] || 0) + 1;
      }
    });

    // Convert Set to count
    Object.keys(daily).forEach(date => {
      daily[date].uniqueSessions = daily[date].uniqueSessions.size;
    });

    return Object.values(daily);
  }

  async getDailyMetrics(tenantId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const events = await this.getEventsInDateRange(tenantId, startDate, endDate);
      const dailyBreakdown = this.getDailyBreakdown(events, startDate, endDate);

      return {
        tenantId,
        period: `${days} days`,
        metrics: dailyBreakdown,
        summary: {
          totalEvents: events.length,
          avgEventsPerDay: events.length / days,
          totalSessions: new Set(events.map(e => e.sessionId).filter(Boolean)).size,
          mostActiveDay: dailyBreakdown.reduce((max, day) => 
            day.totalEvents > max.totalEvents ? day : max, dailyBreakdown[0])
        }
      };
    } catch (error) {
      logger.error('Error getting daily metrics:', error);
      throw error;
    }
  }

  async generateReport(tenantId, dateRange = 30) {
    try {
      const overview = await this.getTenantOverview(tenantId, dateRange);
      const dailyMetrics = await this.getDailyMetrics(tenantId, dateRange);

      const report = {
        tenantId,
        generatedAt: new Date().toISOString(),
        period: `${dateRange} days`,
        overview,
        dailyMetrics: dailyMetrics.metrics,
        insights: {
          totalEngagement: overview.totalEvents,
          sessionConversionRate: overview.uniqueSessions > 0 
            ? ((overview.eventTypes.message_sent || 0) / overview.uniqueSessions * 100).toFixed(2) + '%'
            : '0%',
          avgSessionLength: overview.uniqueSessions > 0 
            ? (overview.totalEvents / overview.uniqueSessions).toFixed(1)
            : '0',
          topEventTypes: Object.entries(overview.eventTypes)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([type, count]) => ({ type, count }))
        }
      };

      return report;
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  async cleanupOldEvents(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const files = await fs.readdir(ANALYTICS_DIR);
      let cleanedCount = 0;

      for (const file of files) {
        if (file.endsWith('.jsonl')) {
          const match = file.match(/^(.+)_(\d{4}-\d{2}-\d{2})\.jsonl$/);
          if (match) {
            const fileDate = new Date(match[2]);
            if (fileDate < cutoffDate) {
              await fs.unlink(path.join(ANALYTICS_DIR, file));
              cleanedCount++;
              logger.info(`Cleaned up old analytics file: ${file}`);
            }
          }
        }
      }

      return { cleanedFiles: cleanedCount, cutoffDate: cutoffDate.toISOString() };
    } catch (error) {
      logger.error('Error cleaning up old events:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
