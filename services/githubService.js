// services/githubService.js

const axios = require('axios');
const { getCache, setCache } = require('./cacheService');

const GITHUB_API = 'https://api.github.com';

/**
 * Fetch GitHub user profile
 */
const getUserProfile = async (accessToken, username) => {
  const cacheKey = `github:profile:${username}`;

  const cached = await getCache(cacheKey);

  if (cached) {
    console.log(`Cache HIT: ${cacheKey}`);
    return cached;
  }

  console.log(`Cache MISS: ${cacheKey} — fetching from GitHub`);

  const response = await axios.get(
    `${GITHUB_API}/users/${username}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json'
      }
    }
  );

  const profile = {
    login: response.data.login,
    avatarUrl: response.data.avatar_url,
    publicRepos: response.data.public_repos,
    followers: response.data.followers,
    following: response.data.following,
    bio: response.data.bio,
    createdAt: response.data.created_at
  };

  await setCache(cacheKey, profile, 3600);

  return profile;
};

/**
 * Fetch repositories
 */
const getUserRepos = async (accessToken, username) => {
  const cacheKey = `github:repos:${username}`;

  const cached = await getCache(cacheKey);

  if (cached) {
    console.log(`Cache HIT: ${cacheKey}`);
    return cached;
  }

  console.log(`Cache MISS: ${cacheKey} — fetching from GitHub`);

  const response = await axios.get(
    `${GITHUB_API}/users/${username}/repos`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json'
      },
      params: {
        per_page: 100,
        sort: 'updated'
      }
    }
  );

  const repos = response.data.map(repo => ({
    name: repo.name,
    language: repo.language,
    stargazersCount: repo.stargazers_count,
    forksCount: repo.forks_count,
    updatedAt: repo.updated_at,
    isPrivate: repo.private
  }));

  await setCache(cacheKey, repos, 3600);

  return repos;
};

/**
 * Calculate top languages
 */
const getTopLanguages = (repos) => {
  const langCount = {};

  repos.forEach(repo => {
    if (repo.language) {
      langCount[repo.language] =
        (langCount[repo.language] || 0) + 1;
    }
  });

  return Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => lang);
};

/**
 * Fetch commit events
 */
const getCommitEvents = async (accessToken, username) => {
  const cacheKey = `github:events:${username}`;

  const cached = await getCache(cacheKey);

  if (cached) {
    console.log(`Cache HIT: ${cacheKey}`);
    return cached;
  }

  console.log(`Cache MISS: ${cacheKey} — fetching from GitHub`);

  const response = await axios.get(
    `${GITHUB_API}/users/${username}/events`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json'
      },
      params: {
        per_page: 100
      }
    }
  );

  const pushEvents = response.data.filter(
    event => event.type === 'PushEvent'
  );

  await setCache(cacheKey, pushEvents, 1800);

  return pushEvents;
};

/**
 * Calculate commit streak
 */
const calculateStreak = (pushEvents) => {
  if (!pushEvents.length) {
    return 0;
  }

  const commitDays = new Set(
    pushEvents.map(event =>
      event.created_at.split('T')[0]
    )
  );

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const dateStr = date
      .toISOString()
      .split('T')[0];

    if (commitDays.has(dateStr)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

module.exports = {
  getUserProfile,
  getUserRepos,
  getTopLanguages,
  getCommitEvents,
  calculateStreak
};