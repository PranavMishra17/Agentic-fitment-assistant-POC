# Agentic-fitment-assistant-POC [in development]
POC for white-label automotive fitment assistant with agentic LLM chat widget, multi-tenant configuration, and MCP integration for wheel/tire retailers.


> A proof-of-concept platform for automotive fitment assistance using agentic LLM technology. Provides white-label chat widgets for wheel and tire retailers with multi-tenant configuration and analytics.

## 🚀 Features

- **Agentic AI Chat**: Intelligent fitment recommendations using LLM
- **White-Label Widget**: Customizable chat interface for client branding
- **Multi-Tenant**: Individual configurations per client
- **CDN Deployment**: Global widget distribution via Cloudflare Pages
- **Analytics Dashboard**: Session tracking and engagement metrics
- **MCP Integration**: Model Context Protocol support for enhanced AI capabilities
- **Easy Integration**: 2-line embed code for any website

## 🏗️ Architecture

```
┌─── CDN (Cloudflare) ────┐    ┌─── Backend API (Heroku) ────┐
│  • widget.js            │    │  • Tenant Management        │
│  • chat-widget.js       │◄──►│  • Session Logging          │
│  • widget.css           │    │  • Analytics Engine         │
└─────────────────────────┘    └─────────────────────────────┘
                                               │
                              ┌─── Dashboard (React) ────┐
                              │  • Configuration UI      │
                              │  • Analytics Dashboard   │
                              │  • Tenant Management     │
                              └─────────────────────────┘
```

## 🎯 Use Cases

- **Wheel Retailers**: Help customers find compatible wheels for their vehicles
- **Tire Shops**: Assist with tire sizing and fitment questions
- **Auto Parts**: Provide instant fitment support for suspension, brakes, etc.
- **E-commerce**: Reduce support tickets with intelligent chat assistance

## 📦 Quick Start

### 1. Setup Development Environment
```bash
# Install dependencies
npm install

# Create environment file
copy env.example .env
# Edit .env with your Cloudflare credentials

# Build admin dashboard
npm run build-admin

# Start development server
npm run dev
```

### 2. Access the Platform
- **Main Site**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Widget Test**: http://localhost:3000/test
- **Demo Sites**: 
  - Car Dealership: http://localhost:3000/demo-car-dealership.html
  - Wheel Shop: http://localhost:3000/demo-wheel-shop.html

## 🚀 For Clients - Widget Integration

### Simple 2-Line Integration
Add this code to your website before the closing `</body>` tag:

```html
<!-- Replace 'your-tenant-id' with your actual tenant ID -->
<script src="https://fitment-assistant-wheelprice.pages.dev/widget.js" 
        data-tenant="your-tenant-id"></script>
```

### Available Tenant IDs
- `demo-tenant-123` - Demo Wheel Shop (Blue theme)
- `premium-auto-456` - Premium Auto Dealership (Orange theme) 
- `speed-wheels-789` - Speed Wheels Co (Green theme)

### Widget Features
- ✅ **Floating Cloud Design** - Appears as a professional chat bubble
- ✅ **Custom Branding** - Colors, fonts, and messages match your brand
- ✅ **Mobile Responsive** - Works perfectly on all devices
- ✅ **Intelligent Responses** - AI-powered automotive fitment assistance
- ✅ **Analytics Tracking** - Monitor customer engagement

### Example Integration
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Auto Shop</title>
</head>
<body>
    <h1>Welcome to My Auto Shop</h1>
    <p>Your content here...</p>
    
    <!-- Fitment Assistant Widget -->
    <script src="https://fitment-assistant-wheelprice.pages.dev/widget.js" 
            data-tenant="demo-tenant-123"></script>
</body>
</html>
```

The widget will automatically:
- Load with your custom theme
- Position itself in the bottom-right corner
- Provide intelligent automotive assistance
- Track analytics for your admin dashboard

## 🛠️ Technology Stack

- **Frontend**: Vanilla JS widget, React dashboard
- **Backend**: Node.js/Express API
- **Storage**: File-based (POC), ready for database migration
- **CDN**: Cloudflare Pages
- **Hosting**: Heroku
- **AI**: Agentic LLM with hardcoded responses (POC)

## 📊 Analytics & Tracking

- Session management with individual log files
- Event tracking (widget loads, messages, conversions)
- Real-time dashboard with engagement metrics
- GDPR-compliant data handling

## 🎨 Customization

- Brand colors and fonts
- Logo integration
- Custom welcome messages
- Widget positioning
- Theme adaptation (light/dark mode)

## 🔧 Configuration

Tenant configurations support:
- Brand identity settings
- Theme customization
- Feature toggles
- Analytics preferences
- Integration options

## 📚 Documentation

- [Client Integration Guide](docs/client-integration.md)
- [Admin Setup Guide](docs/admin-setup.md)
- [API Reference](docs/api-reference.md)
- [Deployment Guide](docs/deployment.md)

## 🤝 Contributing

This is a POC project. For production deployment:
1. Replace file storage with database
2. Implement real LLM integration
3. Add authentication system
4. Enhance security measures

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🚧 POC Status

**✅ COMPLETED**: Full local development environment with:
- ✅ White-label widget system
- ✅ Multi-tenant configuration  
- ✅ Session logging & analytics
- ✅ Admin dashboard (React)
- ✅ Test environment
- ✅ File-based storage
- ✅ CDN-ready assets
- ✅ Navigation & routing
- ✅ Sample data

**🎯 CDN Deployment Required**:
Upload these files to Cloudflare Pages:
- `cdn-assets/widget.js`
- `cdn-assets/chat-widget.js`  
- `cdn-assets/widget.css`

**🚀 Production Roadmap**:
- Database integration (PostgreSQL/MongoDB)
- Real LLM/MCP implementation  
- Advanced authentication & security
- Performance optimization
- Docker containerization

## 📞 Support

For POC demonstration or implementation questions, please open an issue or contact the development team.
