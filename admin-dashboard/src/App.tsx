import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TenantList from './components/TenantList';
import TenantEditor from './components/TenantEditor';
import Analytics from './components/Analytics';
import ChatLogs from './components/ChatLogs';
import TestWidget from './components/TestWidget';
import './App.css';

function App() {
  return (
    <Router basename="/admin">
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tenants" element={<TenantList />} />
          <Route path="/tenants/new" element={<TenantEditor />} />
          <Route path="/tenants/:tenantId/edit" element={<TenantEditor />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/chat-logs" element={<ChatLogs />} />
          <Route path="/test" element={<TestWidget />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
