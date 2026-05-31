// routes/githubRoutes.js
const express = require('express');
const router = express.Router();
const { getMyStats } = require('../controllers/githubController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getMyStats);

module.exports = router;