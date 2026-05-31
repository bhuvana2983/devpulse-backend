// services/cacheService.js

const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: process.env.REDIS_URL?.startsWith('rediss://'),
    rejectUnauthorized: false
  }
});

client.on('connect', () => {
  console.log('Redis Connected');
});

client.on('error', (err) => {
  console.error('Redis Error:', err);
});

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Redis Connection Failed:', err);
  }
})();

const getCache = async (key) => {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Cache GET Error:', err);
    return null;
  }
};

const setCache = async (key, value, ttl = 3600) => {
  try {
    await client.setEx(
      key,
      ttl,
      JSON.stringify(value)
    );
  } catch (err) {
    console.error('Cache SET Error:', err);
  }
};

const deleteCache = async (key) => {
  try {
    await client.del(key);
  } catch (err) {
    console.error('Cache DELETE Error:', err);
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache
};