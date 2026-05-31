// models/ActivitySnapshot.js
const mongoose = require('mongoose');

const ActivitySnapshotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',          // References the User model — this is a foreign key
    required: true
  },
  date: {
    type: String,         // Format: "2026-05-31" — easier to query by day
    required: true
  },
  totalCommits: {
    type: Number,
    default: 0
  },
  reposContributed: {
    type: Number,
    default: 0
  },
  topLanguages: {
    type: [String],       // Array: ["JavaScript", "Python", "Go"]
    default: []
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  publicRepos: {
    type: Number,
    default: 0
  },
  followers: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Compound index: one snapshot per user per day — prevents duplicates
ActivitySnapshotSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ActivitySnapshot', ActivitySnapshotSchema);