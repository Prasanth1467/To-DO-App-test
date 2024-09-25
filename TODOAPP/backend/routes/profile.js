const express = require('express');
const { getUserProfile, updateUserProfile } = require('../models/user');
const router = express.Router();

// Get user profile
router.get('/', (req, res) => {
  const userId = req.userId;

  getUserProfile(userId, (err, user) => {
    if (err) return res.status(500).json({ message: 'Error fetching user profile' });
    res.json(user);
  });
});

// Update user profile
router.put('/', (req, res) => {
  const userId = req.userId;
  const { name, email, password } = req.body;

  updateUserProfile(userId, name, email, password, (err) => {
    if (err) return res.status(500).json({ message: 'Error updating profile' });
    res.json({ message: 'Profile updated successfully' });
  });
});

module.exports = router;
