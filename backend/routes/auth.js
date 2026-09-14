import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users, nextId } from '../db.js';

export const router = express.Router();
export const JWT_SECRET = process.env.JWT_SECRET || 'ein_secret_key_2026_super_secure';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  try {
    const user = await users.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'Invalid email or password' });
    const account = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.json({ message: 'Login successful', token: jwt.sign(account, JWT_SECRET, { expiresIn: '24h' }), user: account });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });
  try {
    if (await users.findOne({ email })) return res.status(400).json({ error: 'User with this email already exists' });
    const account = { id: await nextId(users), name, email, role: ['admin', 'field_officer', 'public'].includes(role) ? role : 'public' };
    await users.insertOne({ ...account, password_hash: await bcrypt.hash(password, 10) });
    res.status(201).json({ message: 'User registered successfully', token: jwt.sign(account, JWT_SECRET, { expiresIn: '24h' }), user: account });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});
