import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalSessions: number;
  totalMessages: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTenants: 0,
    activeTenants: 0,
    totalSessions: 0,
    totalMessages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load tenants
      const tenantsResponse = await axios.get('/api/config');
      const tenants = tenantsResponse.data;
      
      const totalTenants = tenants.length;
      const activeTenants = tenants.filter((t: any) => t.enabled).length;

      // Get actual stats from all tenants
      let totalSessions = 0;
      let totalMessages = 0;
      
      for (const tenant of tenants) {
        try {
          const statsResponse = await axios.get(`/api/chat/tenant/${tenant.tenantId}/stats`);
          totalSessions += statsResponse.data.totalSessions || 0;
          totalMessages += statsResponse.data.totalMessages || 0;
        } catch (error) {
          console.warn(`Could not load stats for tenant ${tenant.tenantId}`);
        }
      }

      setStats({
        totalTenants,
        activeTenants,
        totalSessions,
        totalMessages
      });
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError(error.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your fitment assistant platform</p>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          Loading dashboard data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your fitment assistant platform</p>
        </div>
        <div className="error-message">
          {error}
        </div>
        <button className="btn btn-primary" onClick={loadDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Tenants',
      value: stats.totalTenants,
      icon: '🏪',
      color: '#007bff',
      link: '/tenants'
    },
    {
      title: 'Active Tenants',
      value: stats.activeTenants,
      icon: '✅',
      color: '#28a745',
      link: '/tenants'
    },
    {
      title: 'Total Sessions',
      value: stats.totalSessions,
      icon: '💬',
      color: '#17a2b8',
      link: '/analytics'
    },
    {
      title: 'Total Messages',
      value: stats.totalMessages,
      icon: '📝',
      color: '#ffc107',
      link: '/analytics'
    }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your fitment assistant platform</p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px',
        marginBottom: '32px'
      }}>
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="card" style={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}>
              <div className="card-content">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ 
                      fontSize: '32px', 
                      fontWeight: 'bold', 
                      color: card.color,
                      marginBottom: '8px'
                    }}>
                      {card.value.toLocaleString()}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#666',
                      fontWeight: '500'
                    }}>
                      {card.title}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '32px',
                    opacity: 0.7
                  }}>
                    {card.icon}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="card-content">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '16px' 
          }}>
            <Link to="/tenants/new" className="btn btn-primary">
              <span>➕</span>
              Create New Tenant
            </Link>
            <Link to="/test" className="btn btn-outline">
              <span>🧪</span>
              Test Widget
            </Link>
            <Link to="/analytics" className="btn btn-outline">
              <span>📊</span>
              View Analytics
            </Link>
            <a href="/health" target="_blank" rel="noopener noreferrer" className="btn btn-outline">
              <span>❤️</span>
              System Health
            </a>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Getting Started</h2>
        </div>
        <div className="card-content">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px' 
          }}>
            <div>
              <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px' }}>
                🏪 1. Create Your First Tenant
              </h3>
              <p style={{ color: '#666', margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.5' }}>
                Set up a tenant configuration with your brand colors, logo, and messaging. Each tenant gets their own widget instance.
              </p>
              <Link to="/tenants/new" className="btn btn-sm btn-primary">
                Create Tenant
              </Link>
            </div>
            
            <div>
              <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px' }}>
                📦 2. Deploy CDN Assets
              </h3>
              <p style={{ color: '#666', margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.5' }}>
                Upload the widget files from <code>cdn-assets/</code> to Cloudflare Pages for global distribution.
              </p>
              <div className="code-block" style={{ fontSize: '11px', padding: '8px 12px' }}>
                Upload: widget.js, chat-widget.js, widget.css
              </div>
            </div>
            
            <div>
              <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px' }}>
                🧪 3. Test Integration
              </h3>
              <p style={{ color: '#666', margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.5' }}>
                Use the test page to verify your widget works correctly before deploying to customer websites.
              </p>
              <Link to="/test" className="btn btn-sm btn-outline">
                Test Widget
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
