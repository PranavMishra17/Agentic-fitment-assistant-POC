import React from 'react';

const TestWidget: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Test Widget</h1>
        <p className="page-subtitle">Live widget demonstration and testing</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Widget Test Environment</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '20px', color: '#666' }}>
            The widget test page provides a live demonstration environment where you can interact with 
            the fitment assistant widget and test its functionality.
          </p>
          
          <div style={{ 
            background: '#f8f9fa', 
            border: '1px solid #e9ecef', 
            borderRadius: '8px', 
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>Test Features:</h3>
            <ul style={{ margin: '0', paddingLeft: '20px', color: '#666' }}>
              <li>Interactive chat interface</li>
              <li>Hardcoded fitment responses for automotive queries</li>
              <li>Real-time analytics tracking</li>
              <li>Mobile-responsive design testing</li>
              <li>Theme and branding preview</li>
            </ul>
          </div>

          <div style={{ 
            background: '#e8f4fd', 
            border: '1px solid #bee5eb', 
            borderRadius: '8px', 
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#0c5460' }}>Sample Questions to Try:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '8px' }}>
              <div style={{ fontSize: '14px', color: '#0c5460' }}>• "What wheels fit my BMW 3 Series?"</div>
              <div style={{ fontSize: '14px', color: '#0c5460' }}>• "I need tires for my Honda Civic"</div>
              <div style={{ fontSize: '14px', color: '#0c5460' }}>• "Help me choose wheels for my Ford Mustang"</div>
              <div style={{ fontSize: '14px', color: '#0c5460' }}>• "What's the difference between offset?"</div>
              <div style={{ fontSize: '14px', color: '#0c5460' }}>• "What size tires should I get?"</div>
              <div style={{ fontSize: '14px', color: '#0c5460' }}>• "What's your budget range?"</div>
            </div>
          </div>

          <div className="d-flex gap-2">
            <a 
              href="/test" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              🧪 Open Test Page
            </a>
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              🏠 View Main Site
            </a>
          </div>
        </div>
      </div>

      {/* Embedded Test Page */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Live Preview</h2>
        </div>
        <div className="card-content">
          <p style={{ marginBottom: '16px', color: '#666' }}>
            Below is an embedded version of the test page. The widget should appear in the bottom-right corner.
          </p>
          
          <div style={{ 
            border: '2px solid #e9ecef', 
            borderRadius: '8px', 
            overflow: 'hidden',
            background: '#f8f9fa'
          }}>
            <div style={{ 
              background: '#6c757d', 
              color: 'white', 
              padding: '8px 12px', 
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: '#28a745' 
              }}></div>
              Test Widget Environment - /test
            </div>
            
            <iframe
              src="/test"
              style={{
                width: '100%',
                height: '600px',
                border: 'none',
                background: 'white'
              }}
              title="Widget Test Environment"
            />
          </div>
          
          <div style={{ 
            fontSize: '12px', 
            color: '#6c757d', 
            marginTop: '12px',
            textAlign: 'center'
          }}>
            💡 If the widget doesn't appear, make sure the CDN assets are deployed and the demo tenant exists.
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Testing Instructions</h2>
        </div>
        <div className="card-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div>
              <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px' }}>
                🎯 1. Basic Functionality
              </h3>
              <ul style={{ margin: '0', paddingLeft: '16px', color: '#666', fontSize: '14px' }}>
                <li>Click the chat button to open the widget</li>
                <li>Type a message and press Enter</li>
                <li>Verify you receive an automated response</li>
                <li>Test the close button functionality</li>
              </ul>
            </div>
            
            <div>
              <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px' }}>
                📱 2. Responsive Testing
              </h3>
              <ul style={{ margin: '0', paddingLeft: '16px', color: '#666', fontSize: '14px' }}>
                <li>Resize your browser window</li>
                <li>Test on mobile viewport sizes</li>
                <li>Verify touch interactions work</li>
                <li>Check widget positioning adapts</li>
              </ul>
            </div>
            
            <div>
              <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px' }}>
                🎨 3. Theme Verification
              </h3>
              <ul style={{ margin: '0', paddingLeft: '16px', color: '#666', fontSize: '14px' }}>
                <li>Check brand colors are applied</li>
                <li>Verify font family is correct</li>
                <li>Test hover and focus states</li>
                <li>Confirm positioning is accurate</li>
              </ul>
            </div>
            
            <div>
              <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: '16px' }}>
                📊 4. Analytics Tracking
              </h3>
              <ul style={{ margin: '0', paddingLeft: '16px', color: '#666', fontSize: '14px' }}>
                <li>Interact with the widget</li>
                <li>Check browser dev tools for network requests</li>
                <li>Visit the Analytics tab to see tracked events</li>
                <li>Verify session data is being recorded</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestWidget;
