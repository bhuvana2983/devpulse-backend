// controllers/dashboardController.js
const ActivitySnapshot = require('../models/ActivitySnapshot');
const User = require('../models/User');

/**
 * GET /api/dashboard/history
 * Returns last 30 days of snapshots for logged-in user
 */
const getHistory = async (req, res) => {
  try {
    const snapshots = await ActivitySnapshot.find({ userId: req.user._id })
      .sort({ date: -1 })  // Most recent first
      .limit(30);

    res.json(snapshots);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history' });
  }
};

/**
 * GET /api/dashboard/public/:slug
 * Public profile — no auth needed
 */
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ profileSlug: req.params.slug });

    if (!user) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Get latest snapshot
    const latest = await ActivitySnapshot.findOne({ userId: user._id })
      .sort({ date: -1 });

    res.json({
      username: user.username,
      avatarUrl: user.avatarUrl,
      profileSlug: user.profileSlug,
      latestSnapshot: latest
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

module.exports = { getHistory, getPublicProfile };