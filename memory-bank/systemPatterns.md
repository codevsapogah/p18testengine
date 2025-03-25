# System Patterns: Psychology Test Platform (P18)

## Architecture Overview
P18 follows a client-server architecture with:
- React-based SPA frontend
- Node.js/Express backend API
- Supabase database for data storage
- JWT-based authentication system

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    React    │────►│  Node.js/   │────►│  Supabase   │
│  Frontend   │◄────│   Express   │◄────│  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Key Technical Decisions

### Authentication Flow
1. Server-side authentication with JWT tokens
2. HTTP-only cookies for token storage (not localStorage)
3. Server-side password verification
4. Role-based authorization for API endpoints

### Security Patterns
1. All client-server communication via HTTPS
2. Server-side validation of all inputs
3. Filtered data responses based on user roles
4. No direct database access from the client

### Frontend Architecture
1. React component hierarchy with functional components
2. Context API for state management
3. React Router for navigation
4. Tailwind CSS for styling
5. React Query for data fetching and caching

### Backend Architecture
1. Express.js for API routes
2. Controller-based organization
3. Middleware for authentication and authorization
4. Service layer for business logic
5. Data access layer for database operations

### Data Flow Patterns
1. RESTful API design
2. JSON as the data exchange format
3. Error responses with appropriate HTTP status codes
4. Pagination for large data sets

## Component Relationships

### Frontend Components
- Pages: Top-level route components
- Layout: Structure and navigation components
- UI Components: Reusable interface elements
- Form Components: Input and validation components
- Test Components: Specialized components for test administration
- Visualization Components: Charts and data display

### Backend Components
- Routes: Define API endpoints
- Controllers: Handle request processing
- Middleware: Cross-cutting concerns (auth, validation)
- Services: Business logic implementation
- Data Access: Database operations
- Utils: Helper functions and utilities

## Design Patterns in Use

1. **Repository Pattern**: For data access abstraction
2. **Middleware Pattern**: For cross-cutting concerns
3. **Component Composition**: For UI building blocks
4. **Container/Presentational Pattern**: For separation of concerns in UI
5. **Provider Pattern**: For React context distribution
6. **Custom Hooks**: For reusable stateful logic
7. **Service Pattern**: For business logic organization

## Deployment Architecture
The application is deployed with:
- Frontend: Static hosting (Vercel)
- Backend: Node.js server (VPS)
- Database: Hosted Supabase instance
- CI/CD: Automated deployment scripts 