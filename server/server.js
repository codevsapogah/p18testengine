require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const authRoutes = require('./routes/auth');
const coachRoutes = require('./routes/coach');
const adminRoutes = require('./routes/admin');
const emailRoutes = require('./routes/email');
const { verifyToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3031;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS configuration with proper origin handling
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    
    // In development, use specific origins
    if(process.env.NODE_ENV !== 'production') {
      const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3031'];
      if(allowedOrigins.indexOf(origin) === -1) {
        console.log('Blocked origin:', origin);
        return callback(null, false);
      }
      console.log('Allowed origin:', origin);
      return callback(null, true);
    }
    
    // In production, allow the request's origin
    console.log('Production mode, allowing origin:', origin);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/coach', verifyToken, coachRoutes);
app.use('/api/admin', verifyToken, adminRoutes);
app.use('/api/email', emailRoutes);

// Simple health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'Server is running', 
    env: process.env.NODE_ENV,
    port: PORT 
  });
});

// In production, serve the static React files
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  const buildPath = path.join(__dirname, '../build');
  app.use(express.static(buildPath));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(buildPath, 'index.html'));
    }
  });
  
  console.log('Serving React frontend in production mode');
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
}); 