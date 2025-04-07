const IORedis = require("ioredis");

const connection = new IORedis({
  host: "localhost",
  port: 6379,
  maxRetriesPerRequest: null, // ✅ IMPORTANT for BullMQ workers
  enableReadyCheck: false,    // ✅ Optional: avoids extra delays
});

module.exports = connection;
