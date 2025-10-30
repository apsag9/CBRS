import { User } from './models.js';
import { hashPassword, verifyPassword, generateJwtToken } from './services.js';

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, errors: ['Email is required'] };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, errors: ['Invalid email format'] };
  }
  return { isValid: true, errors: [] };
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] };
  }
  if (password.length < 8) {
    return { isValid: false, errors: ['Password must be at least 8 characters long'] };
  }
  return { isValid: true, errors: [] };
}

export async function register(req, res) {
  try {
    const { email, password, role } = req.body;

    // Validate email and password
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.errors[0] });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.errors[0] });
    }

    // Check if email already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Only allow admin role if set by an existing admin
    const userRole = req.user?.role === 'admin' ? (role || 'user') : 'user';

    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash, role: userRole });
    
    return res.status(201).json({ 
      id: user._id, 
      email: user.email, 
      role: user.role 
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    return res.status(500).json({ 
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Basic validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.errors[0] });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Find user and verify credentials
    const user = await User.findOne({ email });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateJwtToken({ 
      sub: user._id.toString(), 
      email: user.email,
      role: user.role 
    });

    // Return success response with user info
    return res.json({ 
      token,
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
}
