const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const TENANTS_DIR = path.join(process.cwd(), 'data/tenants');

class ConfigService {
  constructor() {
    this.ensureDirectoryExists();
  }

  async ensureDirectoryExists() {
    try {
      await fs.access(TENANTS_DIR);
    } catch {
      await fs.mkdir(TENANTS_DIR, { recursive: true });
      logger.info('Created tenants directory');
    }
  }

  async getTenantConfig(tenantId) {
    try {
      const configPath = path.join(TENANTS_DIR, `${tenantId}.json`);
      const data = await fs.readFile(configPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Tenant ${tenantId} not found`);
      }
      logger.error('Error reading tenant config:', error);
      throw error;
    }
  }

  async createTenantConfig(configData) {
    const tenantId = configData.tenantId || `tenant-${uuidv4()}`;
    const timestamp = new Date().toISOString();

    const config = {
      tenantId,
      brandName: configData.brandName || 'Demo Shop',
      logoUrl: configData.logoUrl || '',
      theme: {
        primaryColor: configData.theme?.primaryColor || '#007bff',
        secondaryColor: configData.theme?.secondaryColor || '#6c757d',
        fontFamily: configData.theme?.fontFamily || 'Arial, sans-serif',
        borderRadius: configData.theme?.borderRadius || '8px'
      },
      position: configData.position || 'bottom-right',
      greeting: configData.greeting || 'Hi! Need help finding the right wheels for your vehicle?',
      enabled: configData.enabled !== false,
      features: {
        analytics: configData.features?.analytics !== false,
        sessionRecording: configData.features?.sessionRecording !== false,
        fileUpload: configData.features?.fileUpload || false
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      ...configData
    };

    try {
      const configPath = path.join(TENANTS_DIR, `${tenantId}.json`);
      await fs.writeFile(configPath, JSON.stringify(config, null, 2));
      logger.info(`Created tenant config: ${tenantId}`);
      return config;
    } catch (error) {
      logger.error('Error creating tenant config:', error);
      throw error;
    }
  }

  async updateTenantConfig(tenantId, updates) {
    try {
      const existingConfig = await this.getTenantConfig(tenantId);
      const updatedConfig = {
        ...existingConfig,
        ...updates,
        tenantId, // Ensure tenantId doesn't change
        updatedAt: new Date().toISOString()
      };

      const configPath = path.join(TENANTS_DIR, `${tenantId}.json`);
      await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2));
      logger.info(`Updated tenant config: ${tenantId}`);
      return updatedConfig;
    } catch (error) {
      logger.error('Error updating tenant config:', error);
      throw error;
    }
  }

  async deleteTenantConfig(tenantId) {
    try {
      const configPath = path.join(TENANTS_DIR, `${tenantId}.json`);
      await fs.unlink(configPath);
      logger.info(`Deleted tenant config: ${tenantId}`);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Tenant ${tenantId} not found`);
      }
      logger.error('Error deleting tenant config:', error);
      throw error;
    }
  }

  async listTenants() {
    try {
      const files = await fs.readdir(TENANTS_DIR);
      const tenants = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const tenantId = file.replace('.json', '');
            const config = await this.getTenantConfig(tenantId);
            tenants.push(config);
          } catch (error) {
            logger.warn(`Error reading tenant file ${file}:`, error.message);
          }
        }
      }

      return tenants.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      logger.error('Error listing tenants:', error);
      throw error;
    }
  }

  generateEmbedCode(tenantId, cdnBaseUrl = process.env.CDN_BASE_URL) {
    return `<script src="${cdnBaseUrl}/widget.js" data-tenant="${tenantId}"></script>`;
  }

  async getTenantStats(tenantId) {
    try {
      const config = await this.getTenantConfig(tenantId);
      // This would typically aggregate from analytics and sessions
      return {
        tenantId,
        totalSessions: 0, // Will be implemented with analytics service
        totalMessages: 0,
        lastActivity: null,
        status: config.enabled ? 'active' : 'inactive'
      };
    } catch (error) {
      logger.error('Error getting tenant stats:', error);
      throw error;
    }
  }
}

module.exports = new ConfigService();
