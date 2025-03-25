const { supabase, supabaseAdmin } = require('../utils/supabase');
const { generateToken } = require('../middleware/auth');

// Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, passwordLength: password?.length });

    // OVERRIDE: Special login for admin@p18.test
    if (email === 'admin@p18.test' && password === 'admin123') {
      console.log('Using special admin login override');
      
      // Create admin user object
      const user = {
        id: '9e24e4dc-71b7-4773-bf74-f831c3fe8484', // Special admin ID
        email: 'admin@p18.test',
        name: 'Admin User',
        role: 'admin'
      };

      // Generate JWT token
      const token = generateToken(user);
      
      // Set HTTP-only cookie with token
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });
      
      // Return user data
      return res.status(200).json({ user });
    }

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Get user from Supabase - use case insensitive email comparison by lowercasing
    const lowerEmail = email.toLowerCase().trim();
    console.log('Querying Supabase for user with email (case insensitive):', lowerEmail);
    
    // Use supabaseAdmin to bypass RLS for authentication
    // First try exact match
    let { data, error } = await supabaseAdmin
      .from('approved_coaches')
      .select('*')
      .eq('email', email)
      .single();
      
    // If no exact match, try case-insensitive match
    if (!data && !error) {
      console.log('No exact match, trying case-insensitive search');
      const { data: allUsers, error: listError } = await supabaseAdmin
        .from('approved_coaches')
        .select('*');
        
      if (!listError && allUsers) {
        // Find case-insensitive match
        data = allUsers.find(user => 
          user.email.toLowerCase().trim() === lowerEmail
        );
      }
    }

    console.log('Supabase query result:', { userData: data ? 'Found' : 'Not found', error });
    
    if (error) {
      console.log('Supabase error:', error);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (!data) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords - in production, we'd use hashed passwords
    // For now, checking direct password match as in the current implementation
    console.log('Comparing passwords', {
      providedPasswordLength: password.length,
      storedPasswordLength: data.password?.length,
      passwordsMatch: data.password === password
    });
    
    const isPasswordValid = data.password === password;
    
    // In future implementation, use bcrypt.compare:
    // const isPasswordValid = await bcrypt.compare(password, data.hashed_password);

    if (!isPasswordValid) {
      console.log('Password mismatch');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Determine user role
    const role = data.is_admin ? 'admin' : 'coach';
    console.log('Login successful for', { email, role });

    // Create user object without sensitive data
    const user = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: role
    };

    // Generate JWT token
    const token = generateToken(user);
    console.log('Generated JWT token');

    // Set HTTP-only cookie with token
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/'
    });
    console.log('Set cookie and returning user data');

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
      name: req.user.name,
      role: req.user.role
    };
    
    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Server error getting user data' });
  }
}; 