import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import axios from 'axios';

interface AnalyticsData {
  tenantId: string;
  dateRange: {
    start: string;
    end: string;
  };
  totalEvents: number;
  uniqueSessions: number;
  eventTypes: Record<string, number>;
  dailyBreakdown: Array<{
    date: string;
    totalEvents: number;
    uniqueSessions: number;
  }>;
}

const Analytics: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [dateRange, setDateRange] = useState<number>(7);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      loadAnalytics();
    }
  }, [selectedTenant, dateRange]);

  const loadTenants = async () => {
    try {
      const response = await axios.get('/api/config');
      setTenants(response.data);
      if (response.data.length > 0) {
        setSelectedTenant(response.data[0].tenantId);
      }
    } catch (error: any) {
      console.error('Error loading tenants:', error);
      setError('Failed to load tenants');
    }
  };

  const loadAnalytics = async () => {
    if (!selectedTenant) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/analytics/tenant/${selectedTenant}/overview?days=${dateRange}`);
      setAnalyticsData(response.data);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      setError(error.response?.data?.error || 'Failed to load analytics data');
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const selectedTenantData = tenants.find(t => t.tenantId === selectedTenant);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Track widget engagement and performance</p>
      </div>

      {/* Controls */}
      <div className="card mb-3">
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '16px', alignItems: 'end' }}>
            <div className="form-group mb-0">
              <label className="form-label">Select Tenant</label>
              <select
                className="form-control"
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
              >
                <option value="">Choose a tenant...</option>
                {tenants.map(tenant => (
                  <option key={tenant.tenantId} value={tenant.tenantId}>
                    {tenant.brandName} ({tenant.tenantId})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label">Date Range</label>
              <select
                className="form-control"
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {!selectedTenant ? (
        <div className="card">
          <div className="card-content text-center" style={{ padding: '60px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>Select a Tenant</h3>
            <p style={{ color: '#666', margin: '0' }}>
              Choose a tenant from the dropdown above to view analytics data.
            </p>
          </div>
        </div>
      ) : loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading analytics data...
        </div>
      ) : error ? (
        <div className="error-message">
          {error}
        </div>
      ) : !analyticsData ? (
        <div className="card">
          <div className="card-content text-center" style={{ padding: '60px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
            <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>No Data Available</h3>
            <p style={{ color: '#666', margin: '0' }}>
              No analytics data found for the selected tenant and date range.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div className="card">
              <div className="card-content text-center">
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#007bff' }}>
                  {analyticsData.totalEvents.toLocaleString()}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Total Events</div>
              </div>
            </div>
            <div className="card">
              <div className="card-content text-center">
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>
                  {analyticsData.uniqueSessions.toLocaleString()}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Unique Sessions</div>
              </div>
            </div>
            <div className="card">
              <div className="card-content text-center">
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#17a2b8' }}>
                  {analyticsData.uniqueSessions > 0 
                    ? (analyticsData.totalEvents / analyticsData.uniqueSessions).toFixed(1)
                    : '0'
                  }
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Events per Session</div>
              </div>
            </div>
            <div className="card">
              <div className="card-content text-center">
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffc107' }}>
                  {dateRange}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Days Analyzed</div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Daily Events Chart */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Daily Activity</h3>
              </div>
              <div className="card-content">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.dailyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalEvents" 
                      stroke="#007bff" 
                      strokeWidth={2}
                      name="Total Events"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="uniqueSessions" 
                      stroke="#28a745" 
                      strokeWidth={2}
                      name="Unique Sessions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Event Types Chart */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Event Types</h3>
              </div>
              <div className="card-content">
                {Object.keys(analyticsData.eventTypes).length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={Object.entries(analyticsData.eventTypes).map(([type, count]) => ({
                      type: type.replace('_', ' '),
                      count
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#007bff" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center" style={{ padding: '60px 20px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
                    <div style={{ color: '#666' }}>No event data available</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tenant Info */}
          {selectedTenantData && (
            <div className="card mt-3">
              <div className="card-header">
                <h3 className="card-title">Tenant Information</h3>
              </div>
              <div className="card-content">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>Brand Name</div>
                    <div style={{ color: '#666' }}>{selectedTenantData.brandName}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>Tenant ID</div>
                    <code style={{ fontSize: '12px', background: '#f8f9fa', padding: '2px 6px', borderRadius: '3px' }}>
                      {selectedTenantData.tenantId}
                    </code>
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>Status</div>
                    <div className={`status ${selectedTenantData.enabled ? 'status-active' : 'status-inactive'}`}>
                      <span className="status-dot"></span>
                      {selectedTenantData.enabled ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', marginBottom: '4px' }}>Created</div>
                    <div style={{ color: '#666' }}>
                      {new Date(selectedTenantData.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
