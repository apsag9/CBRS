import { User } from './models.js';
import { hashPassword, verifyPassword, generateJwtToken } from './services.js';

export async function register(req, res) {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash, role });
    return res.status(201).json({ id: user._id, email: user.email, role: user.role });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateJwtToken({ sub: user._id.toString(), role: user.role });
    return res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
}
