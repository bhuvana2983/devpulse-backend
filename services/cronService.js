// services/cronService.js
const cron = require('node-cron');
const User = require('../models/User');
const ActivitySnapshot = require('../models/ActivitySnapshot');
const githubService = require('./githubService');
const { sendDailyDigest } = require('./emailService');

/**
 * Nightly job: runs at 11 PM every day
 * For each user → fetch GitHub data → store snapshot → send email
 */
const startCronJobs = () => {
  cron.schedule('0 23 * * *', async () => {
    console.log('Cron started:', new Date().toISOString());

    try {
      // Fetch all users who want email digests
      const users = await User.find({ emailDigestEnabled: true });
      console.log(`Processing ${users.length} users`);

      for (const user of users) {
        try {
          // Fetch their GitHub data
          const profile = await githubService.getUserProfile(
            user.githubAccessToken,
            user.username
          );
          const repos = await githubService.getUserRepos(
            user.githubAccessToken,
            user.username
          );
          const events = await githubService.getCommitEvents(
            user.githubAccessToken,
            user.username
          );

          const topLanguages = githubService.getTopLanguages(repos);
          const streak = githubService.calculateStreak(events);
          const today = new Date().toISOString().split('T')[0];

          // Save snapshot — upsert means "update if exists, insert if not"
          await ActivitySnapshot.findOneAndUpdate(
            { userId: user._id, date: today },
            {
              totalCommits: events.filter(
                e => e.created_at.startsWith(today)
              ).length,
              reposContributed: repos.length,
              topLanguages,
              currentStreak: streak,
              publicRepos: profile.publicRepos,
              followers: profile.followers
            },
            { upsert: true, new: true }
          );

          // Send email if they have one
          if (user.email) {
            await sendDailyDigest(user.email, user.username, {
              commits: events.filter(e => e.created_at.startsWith(today)).length,
              streak,
              topLanguages,
              repos: profile.publicRepos
            });
          }

          console.log(`Processed: ${user.username}`);
        } catch (userErr) {
          // Don't let one user's failure stop others
          console.error(`Error for ${user.username}:`, userErr.message);
        }
      }
    } catch (err) {
      console.error('Cron job failed:', err.message);
    }
  });

  console.log('Cron jobs registered');
};

module.exports = { startCronJobs };