# SaaS Application - Full Stack

A complete SaaS application with pricing widget builder, plans management, and backend API.

## Project Structure

```
project/
├── saas-app-backend/     # NestJS Backend API
├── saas-app-frontend/    # Angular Frontend Application
└── README.md            # This file
```

## Features

### Frontend (Angular 17)
- 🎨 **Pricing Widget Builder** - Drag & drop widget creation
- 📊 **Plans & Features Dashboard** - Manage pricing plans and features
- 🎯 **Live Preview** - Real-time widget preview
- 📤 **Export Functionality** - HTML/JSON export
- 🌙 **Theme Switching** - Light/dark mode support
- ♿ **Accessibility** - WCAG AA compliant
- 📱 **Responsive Design** - Mobile-first approach

### Backend (NestJS)
- 🔐 **Authentication** - User management and security
- 💳 **Payment Processing** - PayPal integration
- 📋 **Plans Management** - Pricing plans and features
- 🏢 **Workspace Management** - Multi-tenant support
- 💰 **Subscription Management** - Billing and subscriptions
- 🗄️ **Database Integration** - PostgreSQL with TypeORM

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (for backend)

### Backend Setup
```bash
cd saas-app-backend
npm install
npm run start:dev
```

### Frontend Setup
```bash
cd saas-app-frontend
npm install
npm start
```

## Development

### Backend Commands
```bash
npm run start:dev    # Development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
```

### Frontend Commands
```bash
npm start            # Development server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Lint code
```

## Technology Stack

### Frontend
- Angular 17 (Standalone Components)
- Angular CDK (Drag & Drop)
- PrimeNG (UI Components)
- TypeScript 5.x
- RxJS
- Angular Signals

### Backend
- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- PayPal SDK
- JWT Authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
