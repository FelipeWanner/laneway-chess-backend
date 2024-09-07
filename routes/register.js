const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const router = express.Router();

// Register Route
router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate refresh token (valid for 7 days)
    const refreshToken = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Create new user with hashed password and refresh token
    user = await User.create({
      username,
      email,
      password: hashedPassword,
      refreshToken
    });

    // Generate access token (json web token) valid for 1 hour
    const accessToken = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return both access and refresh tokens
    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
