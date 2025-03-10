const jwt = require('jsonwebtoken');

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Check if token is about to expire and refresh it
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp - currentTime < 60 * 60) { // Less than 1 hour remaining
      const newToken = generateToken(decoded);
      res.cookie('token', newToken, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Check admin role middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
};

// Check coach role middleware
const isCoach = (req, res, next) => {
  if (req.user && (req.user.role === 'coach' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ message: 'Forbidden: Coach access required' });
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

module.exports = { verifyToken, isAdmin, isCoach, generateToken }; 