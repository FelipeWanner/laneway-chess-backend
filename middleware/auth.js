const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async function (req, res, next) {
  // Get the JWT from the request header
  const token = req.header('x-auth-token');

  // If no token is provided, deny access
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the provided JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Attach the decoded user info to the request

    // Find the user in the database by ID and check their refresh token
    let user = await User.findByPk(req.user.id);
    if (user && user.refreshToken) {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const tokenExpiration = jwt.decode(user.refreshToken).exp;

      // If the refresh token is within 7 days of expiration, generate a new one
      if (tokenExpiration - now < 7 * 24 * 60 * 60) { // 7 days in seconds
        const newRefreshToken = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '30d' });
        user.refreshToken = newRefreshToken;
        await user.save(); // Save the new refresh token in the database
        res.setHeader('x-refresh-token', newRefreshToken); // Send the new refresh token in the response headers
      }
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error(`Token validation error: ${err.message}`); // Log the error for debugging
    res.status(401).json({ msg: 'Token is not valid' }); // Deny access if the token is invalid
  }
};
