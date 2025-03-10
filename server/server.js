require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const coachRoutes = require('./routes/coach');
const adminRoutes = require('./routes/admin');
const { verifyToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3030;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/coach', verifyToken, coachRoutes);
app.use('/api/admin', verifyToken, adminRoutes);

// Simple health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 