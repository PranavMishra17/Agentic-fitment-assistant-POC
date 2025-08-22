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

### For Retailers (Widget Integration)
```html
<script src="https://cdn.fitment-ai.com/widget.js" 
        data-tenant="your-tenant-id"></script>
```

### For Platform Administrators
1. Clone repository
2. Deploy backend to Heroku
3. Upload CDN assets to Cloudflare Pages
4. Configure tenant dashboard

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

**Current State**: Proof of concept with:
- ✅ White-label widget system
- ✅ Multi-tenant configuration
- ✅ Session logging & analytics
- ✅ CDN deployment ready
- ⏳ Hardcoded AI responses
- ⏳ File-based storage
- ⏳ Basic authentication

**Production Roadmap**:
- Database integration
- Real LLM/MCP implementation
- Advanced authentication
- Enhanced security
- Performance optimization

## 📞 Support

For POC demonstration or implementation questions, please open an issue or contact the development team.
