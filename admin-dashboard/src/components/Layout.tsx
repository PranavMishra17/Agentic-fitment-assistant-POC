import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/tenants', label: 'Tenants', icon: '🏪' },
    { path: '/chat-logs', label: 'Chat Logs', icon: '💬' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/test', label: 'Test Widget', icon: '🧪' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">🚗 Fitment Assistant</h1>
          <p className="sidebar-subtitle">Admin Dashboard</p>
        </div>
        
        <nav>
          <ul className="nav-menu">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ marginTop: 'auto', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            Quick Links
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: '12px', color: '#007bff', textDecoration: 'none' }}
            >
              🏠 Main Site
            </a>
            <a 
              href="/test" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: '12px', color: '#007bff', textDecoration: 'none' }}
            >
              🧪 Widget Test
            </a>
            <a 
              href="/health" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ fontSize: '12px', color: '#007bff', textDecoration: 'none' }}
            >
              ❤️ Health Check
            </a>
          </div>
        </div>
      </div>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
