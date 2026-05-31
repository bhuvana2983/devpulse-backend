// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { githubLogin, githubCallback, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);
router.get('/me', protect, getMe);  // protect runs BEFORE getMe

module.exports = router;