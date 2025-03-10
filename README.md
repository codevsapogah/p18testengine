# P18 Secure Application

This application has been updated to use a secure server-side authentication system.

## Setup Instructions

### Server Setup

1. Install server dependencies:
   ```
   cd server
   npm install
   ```

2. Update the `.env` file in the server directory with your specific configuration:
   - `JWT_SECRET`: Use a strong, random string
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase credentials
   - `CLIENT_URL`: URL of your React app (default: http://localhost:3000)

3. Start the server:
   ```
   npm run dev
   ```

### Client Setup

1. Install client dependencies:
   ```
   npm install
   ```

2. Make sure your `.env.development` file contains:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. Start the client:
   ```
   npm start
   ```

## Security Improvements

- Authentication is now handled server-side with JWT tokens
- Tokens are stored in HTTP-only cookies, not localStorage
- Password verification happens on the server
- Sensitive operations require proper authentication
- API endpoints have proper role-based authorization
- Client no longer has direct database access
- All client-side data is filtered on the server before being sent

## Future Improvements

- Implement proper password hashing with bcrypt
- Add CSRF protection
- Use HTTPS in production
- Implement rate limiting to prevent brute force attacks
- Add Two-Factor Authentication
