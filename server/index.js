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

// Middleware
app.use(cors({
  origin: 'http://localhost:3001',
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

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = 3031;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 