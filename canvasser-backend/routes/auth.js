const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, name, phone });
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

router.post('/check-in', authenticateJWT, async (req, res) => {
  console.log('Check-in request received');
  console.log('User:', req.user);
  console.log('Location:', req.body.location);
  try {
    const { location } = req.body;
    const userId = req.user.userId;
    
    // Here you would typically update the user's check-in status in the database
    // For now, let's just log the check-in
    console.log(`User ${userId} checked in at location:`, location);
    
    res.json({ message: 'Checked in successfully' });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Error during check-in' });
  }
});

module.exports = router;