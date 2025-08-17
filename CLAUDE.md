# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Environment Setup and Running
- `npm start` - Start development server with default environment
- `npm run start:dev` - Start with development environment (.env.dev)
- `npm run start:staging` - Start with staging environment (.env.staging)

### Building
- `npm run build` - Build for production with default environment
- `npm run build:dev` - Build with development environment (.env.dev)
- `npm run build:staging` - Build with staging environment (.env.staging)

### Testing
- `npm test` - Run tests with Jest in jsdom environment
- No additional lint or typecheck commands available in package.json

### Package Management
- Uses both npm (package.json) and pnpm (pnpm-lock.yaml) - prefer pnpm for consistency
- `npm run postinstall` - Runs patch-package automatically after install

## Architecture Overview

### Application Structure
This is a React 18 application built with Create React App, featuring:

**Core Technologies:**
- React Router DOM for routing with protected routes
- React Query (@tanstack/react-query) for API state management
- Bootstrap 5.3.3 + React Bootstrap for UI components
- TypeScript support (though most files are .js)

**Map & Visualization:**
- MapBox GL + MapLibre GL for mapping functionality
- Deck.gl for advanced data visualization layers
- Recharts for chart components
- D3.js for data manipulation

**Authentication & Authorization:**
- Keycloak integration for SSO authentication
- Role-based access control with user levels (A, B, C)
- Protected routes with allowedLevels configuration

### Key Directories Structure

**`src/ComponentsPage/`**
- `Main/` - Primary page components (Admin, Data, Manage, Map, MapGeneral, Value)
- `Sub/` - Reusable sub-components (charts, tables, map components, navbar)
- `Sub_Query/` - React Query hooks for API calls (organized by domain)
- `Sub_config/` - Configuration utilities (formatting, options)

**`src/services/`**
- API service modules organized by domain (api_Admin.js, api_Geo.js, etc.)
- Authentication context and protected route logic
- All API calls use axios with environment-based URLs

**`src/ComponentsStyles/`**
- Component-specific CSS files
- Custom fonts (Sarabun, Noto Sans Thai)

### Environment Configuration
- `.env` - Default environment variables
- `.env.dev` - Development environment (dev-tonmai-tcc.pea.co.th)
- `.env.staging` - Staging environment
- Uses env-cmd for environment-specific builds

### API Integration
- Base API URL from REACT_APP_API_URL environment variable
- RESTful endpoints organized by domain (geo, manage, admin, etc.)
- All API calls include proper error handling and timeouts
- Authentication via Bearer tokens stored in sessionStorage

### Route Protection
Routes are protected with role-based access:
- Level A: Basic access (default)
- Level B: Additional features access
- Level C: Admin access
- Unauthenticated users redirected to Keycloak login

### Key Features
- GIS mapping with corridor and device visualization
- Data management and analysis tools
- Budget and planning tables with export functionality
- Multi-environment deployment support
- Integration with PEA (Provincial Electricity Authority) systems

## Important Notes
- Project appears to be a vegetation management system for electrical infrastructure
- Mixed npm/pnpm usage - be consistent with existing lock files
- Uses session storage for user data persistence
- Patch-package is used for dependency modifications