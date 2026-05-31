// controllers/authController.js

const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * GET /api/auth/github
 */
const githubLogin = (req, res) => {
  const githubAuthUrl =
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=read:user,user:email`;

  res.redirect(githubAuthUrl);
};

/**
 * GET /api/auth/github/callback
 */
const githubCallback = async (req, res) => {
  const { code } = req.query;

  try {
    console.log("========== GITHUB OAUTH ==========");
    console.log("Code:", code);

    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );

    console.log("Token Response:", tokenResponse.data);

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return res.status(400).json({
        message: 'No access token received',
        githubResponse: tokenResponse.data
      });
    }

    const userResponse = await axios.get(
      'https://api.github.com/user',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const githubUser = userResponse.data;

    let email = githubUser.email;

    if (!email) {
      const emailRes = await axios.get(
        'https://api.github.com/user/emails',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      const primaryEmail = emailRes.data.find(
        e => e.primary && e.verified
      );

      email = primaryEmail?.email || null;
    }

    let user = await User.findOne({
      githubId: String(githubUser.id)
    });

    if (!user) {
      user = await User.create({
        githubId: String(githubUser.id),
        username: githubUser.login,
        email,
        avatarUrl: githubUser.avatar_url,
        githubAccessToken: accessToken,
        profileSlug: githubUser.login.toLowerCase()
      });
    } else {
      user.githubAccessToken = accessToken;
      user.avatarUrl = githubUser.avatar_url;
      await user.save();
    }

    const jwtToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log("OAuth Success");

    return res.json({
      success: true,
      token: jwtToken,
      user
    });

  } catch (err) {
    console.error("========== GITHUB ERROR ==========");

    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error(err.message);
    }

    res.status(500).json({
      message: 'OAuth failed',
      error: err.response?.data || err.message
    });
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    avatarUrl: req.user.avatarUrl,
    profileSlug: req.user.profileSlug
  });
};

module.exports = {
  githubLogin,
  githubCallback,
  getMe
};