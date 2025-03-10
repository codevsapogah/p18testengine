const bcrypt = require('bcrypt');
const { supabase } = require('../utils/supabase');
const { generateToken } = require('../middleware/auth');

// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Get user from Supabase
    const { data, error } = await supabase
      .from('approved_coaches')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords - in production, we'd use hashed passwords
    // For now, checking direct password match as in the current implementation
    const isPasswordValid = data.password === password;
    
    // In future implementation, use bcrypt.compare:
    // const isPasswordValid = await bcrypt.compare(password, data.hashed_password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Determine user role
    const role = data.is_admin ? 'admin' : 'coach';

    // Create user object without sensitive data
    const user = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: role
    };

    // Generate JWT token
    const token = generateToken(user);

    // Set HTTP-only cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return user data (without sensitive information)
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// Logout controller
exports.logout = (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully' });
};

// Get current user controller
exports.getCurrentUser = (req, res) => {
  try {
    // User info is already available from verifyToken middleware
    const user = {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    };
    
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Server error getting user data' });
  }
}; 