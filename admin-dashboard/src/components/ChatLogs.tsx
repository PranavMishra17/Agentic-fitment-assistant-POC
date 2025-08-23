import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

interface ChatSession {
  sessionId: string;
  tenantId: string;
  messages: ChatMessage[];
  metadata: {
    messageCount: number;
    firstMessageAt: string;
    lastMessageAt: string;
  };
  createdAt: string;
}

const ChatLogs: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      loadSessions();
    }
  }, [selectedTenant]);

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

  const loadSessions = async () => {
    if (!selectedTenant) return;

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/chat/tenant/${selectedTenant}/sessions`);
      setSessions(response.data);
      setSelectedSession(null);
    } catch (error: any) {
      console.error('Error loading sessions:', error);
      setError(error.response?.data?.error || 'Failed to load chat sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const selectedTenantData = tenants.find(t => t.tenantId === selectedTenant);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Chat Logs</h1>
        <p className="page-subtitle">View and analyze customer conversations</p>
      </div>

      {/* Controls */}
      <div className="card mb-3">
        <div className="card-content">
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
        </div>
      </div>

      {!selectedTenant ? (
        <div className="card">
          <div className="card-content text-center" style={{ padding: '60px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
            <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>Select a Tenant</h3>
            <p style={{ color: '#666', margin: '0' }}>
              Choose a tenant from the dropdown above to view their chat logs.
            </p>
          </div>
        </div>
      ) : loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading chat sessions...
        </div>
      ) : error ? (
        <div className="error-message">
          {error}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Sessions List */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Chat Sessions ({sessions.length})</h3>
            </div>
            <div className="card-content" style={{ padding: '0' }}>
              {sessions.length === 0 ? (
                <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>💭</div>
                  <p style={{ color: '#666', margin: '0' }}>No chat sessions yet</p>
                </div>
              ) : (
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {sessions.map((session) => (
                    <div
                      key={session.sessionId}
                      onClick={() => setSelectedSession(session)}
                      style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid #e1e5e9',
                        cursor: 'pointer',
                        background: selectedSession?.sessionId === session.sessionId ? '#f8f9fa' : 'white',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedSession?.sessionId !== session.sessionId) {
                          e.currentTarget.style.background = '#f8f9fa';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedSession?.sessionId !== session.sessionId) {
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                        Session {session.sessionId.split('-').pop()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                        {session.metadata.messageCount} messages
                      </div>
                      <div style={{ fontSize: '11px', color: '#999' }}>
                        {formatTime(session.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Session Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                {selectedSession 
                  ? `Session ${selectedSession.sessionId.split('-').pop()}`
                  : 'Select a Session'
                }
              </h3>
            </div>
            <div className="card-content">
              {!selectedSession ? (
                <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>👈</div>
                  <p style={{ color: '#666', margin: '0' }}>
                    Click on a session from the left to view the conversation
                  </p>
                </div>
              ) : (
                <div>
                  {/* Session Info */}
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '12px 16px', 
                    borderRadius: '6px',
                    marginBottom: '20px',
                    fontSize: '12px'
                  }}>
                    <div><strong>Session ID:</strong> {selectedSession.sessionId}</div>
                    <div><strong>Started:</strong> {formatTime(selectedSession.createdAt)}</div>
                    <div><strong>Messages:</strong> {selectedSession.metadata.messageCount}</div>
                    {selectedSession.metadata.lastMessageAt && (
                      <div><strong>Last Activity:</strong> {formatTime(selectedSession.metadata.lastMessageAt)}</div>
                    )}
                  </div>

                  {/* Messages */}
                  <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {selectedSession.messages.map((message) => (
                      <div
                        key={message.id}
                        style={{
                          marginBottom: '16px',
                          display: 'flex',
                          justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{ maxWidth: '80%' }}>
                          <div
                            style={{
                              padding: '10px 14px',
                              borderRadius: '18px',
                              background: message.sender === 'user' ? '#007bff' : '#f1f3f5',
                              color: message.sender === 'user' ? 'white' : '#333',
                              borderBottomRightRadius: message.sender === 'user' ? '6px' : '18px',
                              borderBottomLeftRadius: message.sender === 'assistant' ? '6px' : '18px',
                              wordWrap: 'break-word',
                              whiteSpace: 'pre-wrap'
                            }}
                          >
                            {message.message}
                          </div>
                          <div style={{ 
                            fontSize: '11px', 
                            color: '#999', 
                            marginTop: '4px',
                            textAlign: message.sender === 'user' ? 'right' : 'left'
                          }}>
                            {message.sender === 'user' ? 'Customer' : selectedTenantData?.brandName || 'Assistant'} • {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatLogs;
