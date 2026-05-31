// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const { getHistory, getPublicProfile } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/history', protect, getHistory);
router.get('/public/:slug', getPublicProfile);  // No protect — public route

module.exports = router;