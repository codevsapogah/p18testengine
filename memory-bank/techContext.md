# Technical Context: Psychology Test Platform (P18)

## Technology Stack

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Data Fetching**: React Query
- **Animation**: React Spring
- **Charts/Visualization**: Recharts
- **PDF Generation**: jsPDF, jsPDF-autotable
- **Form Input**: React Input Mask
- **Icons**: React Icons

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **Database Client**: Supabase JS Client

### Database
- **Platform**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (now server-side)
- **Storage**: Supabase Storage

### Development Tools
- **Package Manager**: npm
- **Bundler**: React Scripts (Create React App)
- **CSS Processing**: PostCSS, Autoprefixer
- **Linting**: ESLint with React App configuration

## Development Setup

### Prerequisites
- Node.js (v14+)
- npm
- Supabase account with project

### Environment Configuration
- Frontend: `.env.development`, `.env.production`
- Backend: `server/.env`, `server/.env.production`

### Local Development
1. Start backend server: `npm run server:dev`
2. Start frontend: `npm start`

## Technical Constraints

### Security Requirements
- Server-side authentication
- HTTP-only cookies for tokens
- No client-side database access
- Role-based access control
- Data filtering based on user permissions

### Performance Considerations
- Optimized frontend bundle size
- Efficient database queries
- Response caching where appropriate
- Pagination for large datasets

### Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsiveness
- No IE11 support required

## Dependencies

### Core Dependencies
- react, react-dom: UI library
- react-router-dom: Navigation
- @supabase/supabase-js: Database client
- @tanstack/react-query: Data fetching
- jspdf, jspdf-autotable: PDF generation
- recharts: Data visualization
- tailwindcss: Styling
- nodemailer: Email functionality

### Dev Dependencies
- autoprefixer: CSS compatibility
- postcss: CSS processing

## Deployment Architecture

### Frontend Deployment
- Build with `npm run build`
- Deploy static assets to hosting provider (Vercel)
- Environment-specific configuration

### Backend Deployment
- Node.js process on VPS
- PM2 for process management
- Environment-specific configuration
- Deployment scripts (`deploy-backend.sh`)

### Database Configuration
- Supabase hosted instance
- Service role key for backend access
- Row-level security policies 