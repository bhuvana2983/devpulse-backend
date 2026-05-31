// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { startCronJobs } = require('./services/cronService');

// Load .env before anything else
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/github', require('./routes/githubRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Health check endpoint — Render uses this to verify your server is up
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start cron jobs
startCronJobs();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`DevPulse server running on port ${PORT}`);
});