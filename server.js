const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const logger = require('./src/utils/logger');
const { requestLogger } = require('./src/middleware/logging');

const app = express();
const PORT = process.env.PORT || 3000;

// Create necessary directories
const dirs = ['data/tenants', 'data/sessions', 'data/analytics', 'logs', 'public/admin'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created directory: ${dir}`);
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fitment-assistant-wheelprice.pages.dev"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://fitment-assistant-wheelprice.pages.dev"],
      connectSrc: ["'self'", "http://localhost:3000", "https://fitment-assistant-wheelprice.pages.dev"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', // React dev server
    'https://fitment-assistant-wheelprice.pages.dev'
  ],
  credentials: true
}));

// Compression and parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Static file serving
app.use(express.static('public'));

// API routes
app.use('/api', require('./src/routes/api'));

// Admin dashboard route
app.get('/admin*', (req, res) => {
  const adminIndexPath = path.join(__dirname, 'public/admin/index.html');
  if (fs.existsSync(adminIndexPath)) {
    res.sendFile(adminIndexPath);
  } else {
    res.status(404).send(`
      <h1>Admin Dashboard Not Built</h1>
      <p>Please run <code>npm run build-admin</code> to build the admin dashboard.</p>
      <p><a href="/">← Back to Home</a></p>
    `);
  }
});

// Test widget page
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/test-widget.html'));
});

// Auto-generated tenant demo pages
app.get('/demo/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const configService = require('./src/services/configService');
    const config = await configService.getTenantConfig(tenantId);
    
    const demoHtml = generateTenantDemoPage(config);
    res.send(demoHtml);
  } catch (error) {
    res.status(404).send(`
      <h1>Demo Page Not Found</h1>
      <p>Tenant "${req.params.tenantId}" not found.</p>
      <p><a href="/admin">← Back to Admin</a></p>
    `);
  }
});

// Generate demo page HTML for a tenant
function generateTenantDemoPage(config) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.brandName} - Demo Page</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: ${config.theme.fontFamily};
            line-height: 1.6;
            color: #333;
            background: #f8f9fa;
        }
        .header {
            background: ${config.theme.primaryColor};
            color: white;
            padding: 2rem 0;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
        }
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        .content {
            max-width: 1200px;
            margin: 4rem auto;
            padding: 0 2rem;
        }
        .section {
            background: white;
            padding: 3rem;
            margin-bottom: 2rem;
            border-radius: ${config.theme.borderRadius};
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: ${config.theme.primaryColor};
            margin-bottom: 1rem;
        }
        .cta {
            background: ${config.theme.primaryColor};
            color: white;
            padding: 1rem 2rem;
            border: none;
            border-radius: ${config.theme.borderRadius};
            font-size: 1.1rem;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin-top: 1rem;
        }
        .footer {
            background: #333;
            color: white;
            text-align: center;
            padding: 2rem;
            margin-top: 4rem;
        }
        .widget-notice {
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${config.theme.primaryColor};
            color: white;
            padding: 1rem;
            border-radius: ${config.theme.borderRadius};
            font-size: 0.9rem;
            z-index: 1000;
            max-width: 300px;
        }
        @media (max-width: 768px) {
            .header h1 { font-size: 2rem; }
            .content { padding: 0 1rem; }
            .section { padding: 2rem; }
            .widget-notice { position: relative; top: auto; right: auto; margin: 1rem; }
        }
    </style>
</head>
<body>
    <div class="widget-notice">
        💬 <strong>Widget Demo:</strong> Look for the chat button in the bottom-right corner!
    </div>

    <header class="header">
        <h1>${config.brandName}</h1>
        <p>Your trusted automotive partner</p>
    </header>

    <main class="content">
        <section class="section">
            <h2>Welcome to Our Demo Page</h2>
            <p>This is an auto-generated demo page for <strong>${config.brandName}</strong>. The chat widget is active and ready to assist your customers with automotive fitment questions.</p>
            <p>The widget uses your custom branding and theme colors, and will appear in the ${config.position.replace('-', ' ')} of the screen.</p>
        </section>

        <section class="section">
            <h2>Widget Configuration</h2>
            <ul style="margin-left: 2rem;">
                <li><strong>Brand:</strong> ${config.brandName}</li>
                <li><strong>Theme Color:</strong> ${config.theme.primaryColor}</li>
                <li><strong>Position:</strong> ${config.position}</li>
                <li><strong>Font:</strong> ${config.theme.fontFamily}</li>
                <li><strong>Status:</strong> ${config.enabled ? '✅ Active' : '❌ Disabled'}</li>
            </ul>
        </section>

        <section class="section">
            <h2>Try the Chat Widget</h2>
            <p>Click the chat button to test the fitment assistant. Try asking questions like:</p>
            <ul style="margin: 1rem 0 1rem 2rem;">
                <li>"What wheels fit my BMW 3 Series?"</li>
                <li>"I need tires for my Honda Civic"</li>
                <li>"Help me choose wheels for my Ford Mustang"</li>
                <li>"What's the difference between offset and backspacing?"</li>
            </ul>
            <a href="/admin/tenants/${config.tenantId}/edit" class="cta">Edit Widget Settings</a>
        </section>
    </main>

    <footer class="footer">
        <p>&copy; 2024 ${config.brandName}. Demo page powered by WheelPrice Fitment Assistant.</p>
    </footer>

    <!-- Widget Integration -->
    <script src="https://fitment-assistant-wheelprice.pages.dev/widget.js" 
            data-tenant="${config.tenantId}"></script>
</body>
</html>
  `;
}

// Home page with navigation
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fitment Assistant POC</title>
        <style>
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 1200px; 
                margin: 0 auto; 
                padding: 20px;
                background: #f5f5f5;
            }
            .header { 
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                margin-bottom: 30px;
            }
            .nav { 
                display: flex; 
                gap: 15px; 
                flex-wrap: wrap;
                margin-top: 20px;
            }
            .nav a { 
                background: #007bff; 
                color: white; 
                padding: 12px 20px; 
                text-decoration: none; 
                border-radius: 5px;
                font-weight: 500;
                transition: background 0.2s;
            }
            .nav a:hover { background: #0056b3; }
            .content {
                background: white;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .feature { margin-bottom: 20px; }
            .status { 
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }
            .status.ready { background: #d4edda; color: #155724; }
            .status.dev { background: #fff3cd; color: #856404; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚗 Fitment Assistant POC</h1>
            <p>White-label automotive fitment assistant with agentic LLM chat widget</p>
            <nav class="nav">
                <a href="/admin">📊 Admin Dashboard</a>
                <a href="/test">🧪 Widget Test</a>
                <a href="/health">❤️ Health Check</a>
                <a href="/api/config">🔧 API Status</a>
            </nav>
        </div>
        
        <div class="content">
            <h2>🚀 Development Environment</h2>
            
            <div class="feature">
                <h3>📊 Admin Dashboard <span class="status dev">Development</span></h3>
                <p>Manage tenants, view analytics, configure widgets</p>
                <p><strong>Access:</strong> <a href="/admin">/admin</a></p>
            </div>
            
            <div class="feature">
                <h3>🧪 Widget Test Page <span class="status ready">Ready</span></h3>
                <p>Live demonstration of the fitment assistant widget</p>
                <p><strong>Access:</strong> <a href="/test">/test</a></p>
            </div>
            
            <div class="feature">
                <h3>🔌 API Endpoints <span class="status ready">Ready</span></h3>
                <p>RESTful API for tenant management, chat sessions, and analytics</p>
                <p><strong>Base URL:</strong> <code>/api/</code></p>
            </div>
            
            <div class="feature">
                <h3>📦 CDN Assets <span class="status ready">Ready</span></h3>
                <p>Widget files ready for Cloudflare Pages deployment</p>
                <p><strong>Location:</strong> <code>cdn-assets/</code></p>
            </div>
            
            <h2>🛠️ Quick Start</h2>
            <ol>
                <li>Run <code>npm install</code> to install dependencies</li>
                <li>Run <code>npm run setup</code> to build admin dashboard</li>
                <li>Run <code>npm run dev</code> to start development server</li>
                <li>Upload <code>cdn-assets/*</code> to Cloudflare Pages</li>
                <li>Visit <a href="/admin">/admin</a> to create tenants</li>
                <li>Test widgets on <a href="/test">/test</a> page</li>
            </ol>
            
            <h2>📈 Status</h2>
            <p><strong>Server:</strong> Running on port ${PORT}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
            <p><strong>CDN URL:</strong> ${process.env.CDN_BASE_URL || 'Not configured'}</p>
        </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    directories: {
      tenants: fs.existsSync('data/tenants'),
      sessions: fs.existsSync('data/sessions'),
      analytics: fs.existsSync('data/analytics'),
      logs: fs.existsSync('logs')
    }
  };
  
  res.json(health);
});

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <p><a href="/">← Back to Home</a></p>
  `);
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Fitment Assistant POC server running on http://localhost:${PORT}`);
  console.log(`🚗 Fitment Assistant POC`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📊 Admin: http://localhost:${PORT}/admin`);
  console.log(`🧪 Test: http://localhost:${PORT}/test`);
  console.log(`❤️ Health: http://localhost:${PORT}/health`);
});

module.exports = app;
