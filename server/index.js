require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const coachRoutes = require('./routes/coach');
const adminRoutes = require('./routes/admin');
const emailRoutes = require('./routes/email');
const { verifyToken } = require('./middleware/auth');

const app = express();

// Configure allowed origins based on environment
const allowedOrigins = [
  'http://localhost:3000',   // development React app
  'http://localhost:3001',   // alternative development port
  'https://p18.kz',          // production site
  'https://www.p18.kz'       // www subdomain
];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Allowing request with no origin');
      return callback(null, true);
    }
    
    console.log('Request origin:', origin);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      console.error(`CORS blocked: ${origin}`);
      return callback(new Error(msg), false);
    }
    
    console.log(`CORS allowed: ${origin}`);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/coach', verifyToken, coachRoutes);
app.use('/api/admin', verifyToken, adminRoutes);
app.use('/api/email', emailRoutes);

// Public endpoint for unauthenticated access to public data
app.use('/api/public', require('./routes/public'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = 3031;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 