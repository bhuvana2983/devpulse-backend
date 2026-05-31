// controllers/githubController.js
const githubService = require('../services/githubService');
const User = require('../models/User');

/**
 * GET /api/github/stats
 * Returns live GitHub stats for logged-in user
 */
const getMyStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const [profile, repos, events] = await Promise.all([
      githubService.getUserProfile(user.githubAccessToken, user.username),
      githubService.getUserRepos(user.githubAccessToken, user.username),
      githubService.getCommitEvents(user.githubAccessToken, user.username)
    ]);

    // Promise.all runs all 3 API calls in parallel — much faster than sequential

    const topLanguages = githubService.getTopLanguages(repos);
    const streak = githubService.calculateStreak(events);

    res.json({
      username: user.username,
      avatarUrl: profile.avatarUrl,
      publicRepos: profile.publicRepos,
      followers: profile.followers,
      following: profile.following,
      streak,
      topLanguages,
      totalEvents: events.length
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

module.exports = { getMyStats };