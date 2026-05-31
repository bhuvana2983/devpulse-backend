// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
    unique: true   // No two users with same GitHub ID
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  avatarUrl: {
    type: String
  },
  githubAccessToken: {
    type: String,  // We store this to call GitHub API on their behalf
    required: true
  },
  profileSlug: {
    type: String,
    unique: true   // e.g. "torvalds" → devpulse.com/profile/torvalds
  },
  emailDigestEnabled: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);