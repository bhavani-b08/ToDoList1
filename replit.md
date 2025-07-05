# TaskFlow - Task Management Application

## Overview

TaskFlow is a full-stack task management application built with React, Express.js, and PostgreSQL. It provides users with the ability to create, manage, and share tasks with others through a modern web interface. The application features Replit authentication, real-time data synchronization, and a responsive design using shadcn/ui components.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit OIDC integration with session management
- **Database**: PostgreSQL with Drizzle ORM
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful API with JSON responses

### Database Architecture
- **ORM**: Drizzle ORM with TypeScript-first schema definitions
- **Database**: PostgreSQL (configured for Neon Database)
- **Schema**: Shared schema definitions between client and server
- **Migrations**: Drizzle Kit for database migrations

## Key Components

### Authentication System
- Replit OIDC integration for secure user authentication
- Session-based authentication with PostgreSQL storage
- Automatic token refresh and user profile management
- Protected routes with middleware-based authorization

### Task Management System
- CRUD operations for tasks with real-time updates
- Task sharing functionality with email-based permissions
- Status tracking (pending, in progress, completed)
- Priority levels and due date management
- Search and filtering capabilities

### Database Schema
- **Users Table**: Stores user profiles from Replit authentication
- **Tasks Table**: Core task data with user ownership and sharing
- **Sessions Table**: Secure session storage for authentication state

### UI Components
- Reusable component library based on shadcn/ui
- Responsive design with mobile-first approach
- Toast notifications for user feedback
- Modal dialogs for task creation and sharing
- Filtering and sorting interfaces

## Data Flow

1. **Authentication Flow**:
   - User initiates login through Replit OIDC
   - Backend validates tokens and creates session
   - User profile is stored/updated in database
   - Frontend receives authenticated user state

2. **Task Management Flow**:
   - Frontend components use React Query for data fetching
   - API requests include session cookies for authentication
   - Server validates permissions and processes requests
   - Database operations through Drizzle ORM
   - Real-time UI updates via query invalidation

3. **Sharing Flow**:
   - Task owners can share tasks via email addresses
   - Backend validates sharing permissions
   - Shared tasks appear in recipients' task lists
   - Real-time synchronization across all users

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for Neon Database
- **drizzle-orm**: TypeScript ORM for database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React routing

### UI and Styling Dependencies
- **@radix-ui/***: Primitive UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Authentication Dependencies
- **openid-client**: OIDC authentication handling
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session storage

### Development Dependencies
- **vite**: Fast build tool and dev server
- **typescript**: Type safety and development experience
- **@replit/vite-plugin-runtime-error-modal**: Development error handling

## Deployment Strategy

### Development Environment
- Vite development server with HMR for frontend
- Express server with TypeScript compilation via tsx
- Environment variables for database and authentication configuration
- Replit-specific plugins for enhanced development experience

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- esbuild compiles server TypeScript to `dist/index.js`
- Single Node.js process serves both static files and API
- PostgreSQL database connection via environment variables

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `REPLIT_DOMAINS`: Allowed domains for OIDC
- `SESSION_SECRET`: Secure session encryption key
- `ISSUER_URL`: OIDC issuer endpoint (defaults to Replit)

## Changelog
- July 05, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.