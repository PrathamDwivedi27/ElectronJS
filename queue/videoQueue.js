const { Queue } = require("bullmq");
const connection = require("../utils/redisClient");

const videoQueue = new Queue("videoQueue", { connection });

module.exports = videoQueue;
