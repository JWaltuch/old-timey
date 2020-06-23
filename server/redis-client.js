const redis = require('redis');

const client = redis.createClient();
client.on('connect', function () {
  console.log('The redis client is connected.');
});

module.exports = { client }
