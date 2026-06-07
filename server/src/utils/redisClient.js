const redis = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const client = redis.createClient({ url: redisUrl });

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

(async () => {
  try {
    await client.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.warn('Could not connect to Redis:', err.message || err);
  }
})();

module.exports = client;
