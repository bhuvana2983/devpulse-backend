// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // JWT sent in Authorization header as: "Bearer <token>"
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — no token' });
  }

  try {
    // Verify the token using our secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the user to the request (minus password)
    req.user = await User.findById(decoded.id).select('-githubAccessToken');
    
    next(); // Pass control to the next middleware/controller
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized — invalid token' });
  }
};

module.exports = { protect };