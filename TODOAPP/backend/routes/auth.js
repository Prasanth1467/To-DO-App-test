const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createUser, findUserByEmail } = require('../models/user');
const router = express.Router();

const secretKey = 'yourSecretKey';

// Signup Route
router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  findUserByEmail(email, (err, user) => {
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    createUser(name, email, password, (err) => {
      if (err) return res.status(500).json({ message: 'Error creating user' });
      res.status(201).json({ message: 'User created successfully' });
    });
  });
});

// Login Route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  findUserByEmail(email, (err, user) => {
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  });
});

module.exports = router;
