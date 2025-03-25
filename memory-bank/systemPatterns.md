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

## Button Styles

### Results Page Buttons

1. Toggle Buttons (List/Grid View)
```jsx
// Selected state
className="bg-white text-[rgb(107, 70, 193)]"  // White background, purple text
style={{ color: 'rgb(107, 70, 193)' }}         // IMPORTANT: Inline style to ensure text color is applied

// Unselected state
className="text-white hover:bg-white/10"       // White text, transparent background
style={{ color: 'white' }}                     // IMPORTANT: Inline style to ensure text color is applied
```

2. Action Buttons
```jsx
// Download PDF Button
className="py-2.5 px-4 bg-white rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center shadow-sm text-[rgb(107, 70, 193)]"
style={{ color: 'rgb(107, 70, 193)' }}         // IMPORTANT: Inline style to ensure text color is applied

// Call to Action Button (Blue)
className="bg-white text-[rgb(37, 99, 235)] px-4 py-2 rounded-full font-medium text-sm sm:text-base hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
style={{ color: 'rgb(37, 99, 235)' }}          // IMPORTANT: Inline style to ensure text color is applied
```

### IMPORTANT NOTE ON BUTTON TEXT COLORS
Always use both Tailwind classes AND inline styles for text colors on buttons. Some browsers and environments may ignore the Tailwind text color classes, resulting in white-on-white text that's invisible to users. The inline style ensures the text color is always applied correctly.

```jsx
// Correct approach - both class and inline style
<button 
  className="bg-white text-[rgb(107, 70, 193)]"
  style={{ color: 'rgb(107, 70, 193)' }}
>
  Button Text
</button>
```

### Color Constants
- Purple: `rgb(107, 70, 193)`
- Blue: `rgb(37, 99, 235)`
- White: `#FFFFFF`

### Button Container Styles
- Toggle button container: `flex rounded-lg overflow-hidden bg-white/20 shadow-inner`
- Action button container: `grid gap-3 grid-cols-1 sm:grid-cols-2`
- Call to action container: `bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md`

### Common Button Properties
- Font sizes: `text-sm` for regular buttons, `text-sm sm:text-base` for CTA
- Font weight: `font-medium`
- Padding: `py-2.5 px-4` for regular buttons, `px-4 py-2` for CTA
- Transitions: `transition-colors` for color changes
- Hover states: `hover:bg-gray-100` or `hover:bg-white/10`
- Shadow: `shadow-sm` for regular buttons, `shadow-md hover:shadow-lg` for CTA

### Layout Patterns
1. Header Section
   - Purple background: `rgb(107, 70, 193)`
   - Maximum width: `max-w-5xl`
   - Grid layout: `grid-cols-1 sm:grid-cols-2`
   - Padding: `p-4 sm:p-6`

2. Content Section
   - White background
   - Rounded corners: `rounded-lg`
   - Shadow: `shadow-md`
   - Padding: `p-4 sm:p-6`

3. Call to Action Section
   - Blue gradient background
   - Centered content
   - Rounded corners and shadow
   - Margin bottom: `mb-8` 