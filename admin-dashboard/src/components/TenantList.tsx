import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface Tenant {
  tenantId: string;
  brandName: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  theme: {
    primaryColor: string;
  };
}

const TenantList: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/config');
      setTenants(response.data);
    } catch (error: any) {
      console.error('Error loading tenants:', error);
      setError(error.response?.data?.error || 'Failed to load tenants');
    } finally {
      setLoading(false);
    }
  };

  const deleteTenant = async (tenantId: string) => {
    if (!window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/config/${tenantId}`);
      setTenants(tenants.filter(t => t.tenantId !== tenantId));
    } catch (error: any) {
      console.error('Error deleting tenant:', error);
      alert(error.response?.data?.error || 'Failed to delete tenant');
    }
  };

  const toggleTenant = async (tenantId: string, enabled: boolean) => {
    try {
      const response = await axios.put(`/api/config/${tenantId}`, { enabled });
      setTenants(tenants.map(t => 
        t.tenantId === tenantId ? { ...t, enabled } : t
      ));
    } catch (error: any) {
      console.error('Error updating tenant:', error);
      alert(error.response?.data?.error || 'Failed to update tenant');
    }
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Tenants</h1>
          <p className="page-subtitle">Manage your widget configurations</p>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          Loading tenants...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Tenants</h1>
          <p className="page-subtitle">Manage your widget configurations</p>
        </div>
        <div className="error-message">
          {error}
        </div>
        <button className="btn btn-primary" onClick={loadTenants}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Tenants</h1>
            <p className="page-subtitle">Manage your widget configurations</p>
          </div>
          <Link to="/tenants/new" className="btn btn-primary">
            <span>➕</span>
            Create Tenant
          </Link>
        </div>
      </div>

      {tenants.length === 0 ? (
        <div className="card">
          <div className="card-content text-center" style={{ padding: '60px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏪</div>
            <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>No Tenants Yet</h3>
            <p style={{ color: '#666', margin: '0 0 24px 0' }}>
              Create your first tenant to get started with the fitment assistant widget.
            </p>
            <Link to="/tenants/new" className="btn btn-primary">
              Create First Tenant
            </Link>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">All Tenants ({tenants.length})</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Tenant ID</th>
                  <th>Status</th>
                  <th>Theme</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.tenantId}>
                    <td>
                      <div style={{ fontWeight: '500' }}>{tenant.brandName}</div>
                    </td>
                    <td>
                      <code style={{ 
                        fontSize: '12px', 
                        background: '#f8f9fa', 
                        padding: '2px 6px', 
                        borderRadius: '3px' 
                      }}>
                        {tenant.tenantId}
                      </code>
                    </td>
                    <td>
                      <div className={`status ${tenant.enabled ? 'status-active' : 'status-inactive'}`}>
                        <span className="status-dot"></span>
                        {tenant.enabled ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '4px', 
                        background: tenant.theme.primaryColor,
                        border: '1px solid #ddd'
                      }}></div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <a
                          href={`/demo/${tenant.tenantId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline"
                          title="View demo page"
                        >
                          👁️
                        </a>
                        <Link 
                          to={`/tenants/${tenant.tenantId}/edit`}
                          className="btn btn-sm btn-outline"
                          title="Edit tenant"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => toggleTenant(tenant.tenantId, !tenant.enabled)}
                          className={`btn btn-sm ${tenant.enabled ? 'btn-secondary' : 'btn-primary'}`}
                          title={tenant.enabled ? 'Disable' : 'Enable'}
                        >
                          {tenant.enabled ? '⏸️' : '▶️'}
                        </button>
                        <button
                          onClick={() => deleteTenant(tenant.tenantId)}
                          className="btn btn-sm btn-danger"
                          title="Delete tenant"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {tenants.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px',
          marginTop: '24px'
        }}>
          <div className="card">
            <div className="card-content text-center">
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                {tenants.length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Total Tenants</div>
            </div>
          </div>
          <div className="card">
            <div className="card-content text-center">
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                {tenants.filter(t => t.enabled).length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Active Tenants</div>
            </div>
          </div>
          <div className="card">
            <div className="card-content text-center">
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                {tenants.filter(t => !t.enabled).length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Inactive Tenants</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantList;
