import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface TenantConfig {
  tenantId: string;
  brandName: string;
  logoUrl: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    borderRadius: string;
  };
  position: string;
  greeting: string;
  enabled: boolean;
  features: {
    analytics: boolean;
    sessionRecording: boolean;
    fileUpload: boolean;
  };
}

const defaultConfig: Partial<TenantConfig> = {
  brandName: '',
  logoUrl: '',
  theme: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    fontFamily: 'Arial, sans-serif',
    borderRadius: '8px'
  },
  position: 'bottom-right',
  greeting: 'Hi! Need help finding the right wheels for your vehicle?',
  enabled: true,
  features: {
    analytics: true,
    sessionRecording: true,
    fileUpload: false
  }
};

const TenantEditor: React.FC = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!tenantId;

  const [config, setConfig] = useState<Partial<TenantConfig>>(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [embedCode, setEmbedCode] = useState<string>('');

  useEffect(() => {
    if (isEditing) {
      loadTenant();
    }
  }, [tenantId, isEditing]);

  const loadTenant = async () => {
    if (!tenantId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/config/${tenantId}`);
      setConfig(response.data);
      
      // Get embed code
      const embedResponse = await axios.get(`/api/config/${tenantId}/embed`);
      setEmbedCode(embedResponse.data.embedCode);
    } catch (error: any) {
      console.error('Error loading tenant:', error);
      setError(error.response?.data?.error || 'Failed to load tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);

      let response;
      if (isEditing) {
        response = await axios.put(`/api/config/${tenantId}`, config);
      } else {
        response = await axios.post('/api/config', config);
      }

      setEmbedCode(response.data.embedCode);
      
      if (!isEditing) {
        // Navigate to edit mode for the new tenant
        navigate(`/tenants/${response.data.tenantId}/edit`);
      }
    } catch (error: any) {
      console.error('Error saving tenant:', error);
      setError(error.response?.data?.error || 'Failed to save tenant');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (path: string, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">{isEditing ? 'Edit Tenant' : 'Create Tenant'}</h1>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          Loading tenant configuration...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{isEditing ? 'Edit Tenant' : 'Create Tenant'}</h1>
        <p className="page-subtitle">
          {isEditing ? 'Update tenant configuration' : 'Set up a new widget instance'}
        </p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        {/* Configuration Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Configuration</h2>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit}>
              {/* Basic Settings */}
              <div className="form-group">
                <label className="form-label">Brand Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.brandName || ''}
                  onChange={(e) => updateConfig('brandName', e.target.value)}
                  required
                  placeholder="Your Company Name"
                />
                <div className="form-help">This will appear in the widget header</div>
              </div>

              <div className="form-group">
                <label className="form-label">Logo URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={config.logoUrl || ''}
                  onChange={(e) => updateConfig('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <div className="form-help">Optional logo to display in widget (24x24px recommended)</div>
              </div>

              <div className="form-group">
                <label className="form-label">Welcome Message</label>
                <textarea
                  className="form-control"
                  value={config.greeting || ''}
                  onChange={(e) => updateConfig('greeting', e.target.value)}
                  rows={3}
                  placeholder="Hi! How can I help you today?"
                />
              </div>

              {/* Theme Settings */}
              <h3 style={{ margin: '32px 0 16px 0', color: '#333' }}>Theme</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Primary Color</label>
                  <input
                    type="color"
                    className="form-control"
                    value={config.theme?.primaryColor || '#007bff'}
                    onChange={(e) => updateConfig('theme.primaryColor', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Secondary Color</label>
                  <input
                    type="color"
                    className="form-control"
                    value={config.theme?.secondaryColor || '#6c757d'}
                    onChange={(e) => updateConfig('theme.secondaryColor', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Font Family</label>
                <select
                  className="form-control"
                  value={config.theme?.fontFamily || 'Arial, sans-serif'}
                  onChange={(e) => updateConfig('theme.fontFamily', e.target.value)}
                >
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">System</option>
                  <option value="'Helvetica Neue', Helvetica, Arial, sans-serif">Helvetica</option>
                  <option value="Georgia, serif">Georgia</option>
                  <option value="'Times New Roman', serif">Times New Roman</option>
                </select>
              </div>

              {/* Position Settings */}
              <h3 style={{ margin: '32px 0 16px 0', color: '#333' }}>Position</h3>
              
              <div className="form-group">
                <label className="form-label">Widget Position</label>
                <select
                  className="form-control"
                  value={config.position || 'bottom-right'}
                  onChange={(e) => updateConfig('position', e.target.value)}
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>

              {/* Features */}
              <h3 style={{ margin: '32px 0 16px 0', color: '#333' }}>Features</h3>
              
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={config.enabled !== false}
                    onChange={(e) => updateConfig('enabled', e.target.checked)}
                  />
                  <span>Widget Enabled</span>
                </label>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={config.features?.analytics !== false}
                    onChange={(e) => updateConfig('features.analytics', e.target.checked)}
                  />
                  <span>Analytics Tracking</span>
                </label>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={config.features?.sessionRecording !== false}
                    onChange={(e) => updateConfig('features.sessionRecording', e.target.checked)}
                  />
                  <span>Session Recording</span>
                </label>
              </div>

              {/* Submit */}
              <div className="d-flex gap-2 justify-content-end" style={{ marginTop: '32px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate('/tenants')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="spinner" style={{ width: '14px', height: '14px' }}></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      {isEditing ? 'Update Tenant' : 'Create Tenant'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview & Embed Code */}
        <div>
          {/* Preview */}
          <div className="card mb-3">
            <div className="card-header">
              <h3 className="card-title">Preview</h3>
            </div>
            <div className="card-content">
              <div style={{
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <div style={{
                  display: 'inline-block',
                  background: config.theme?.primaryColor || '#007bff',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: config.theme?.borderRadius || '8px',
                  fontFamily: config.theme?.fontFamily || 'Arial, sans-serif',
                  fontSize: '14px'
                }}>
                  {config.brandName || 'Your Brand'} Chat
                </div>
                <div style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  Position: {config.position || 'bottom-right'}
                </div>
              </div>
            </div>
          </div>

          {/* Embed Code */}
          {embedCode && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Embed Code</h3>
              </div>
              <div className="card-content">
                <div className="code-block" style={{ fontSize: '12px' }}>
                  {embedCode.replace('https://cdn-fitment.pages.dev', 'https://fitment-assistant-wheelprice.pages.dev')}
                </div>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => navigator.clipboard.writeText(embedCode)}
                >
                  📋 Copy Code
                </button>
                <div className="form-help mt-2">
                  Paste this code before the closing &lt;/body&gt; tag on your website.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantEditor;
