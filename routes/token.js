const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

// Token Refresh Route
router.post('/', async (req, res) => {
  const { refreshToken } = req.body;

  // Check if refresh token is provided
  if (!refreshToken) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Find user by refresh token
    const user = await User.findOne({ where: { refreshToken } });
    if (!user) {
      return res.status(403).json({ msg: 'Invalid token' });
    }

    // Generate new access token (json web token) valid for 1 hour
    const accessToken = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return the new access token
    res.json({ accessToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
