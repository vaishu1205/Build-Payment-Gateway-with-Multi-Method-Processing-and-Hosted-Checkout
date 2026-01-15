const Bull = require("bull");
require("dotenv").config();

const redisUrl = process.env.REDIS_URL || "redis://redis:6379";

// Create queues for different job types
const paymentQueue = Bull("payment-processing", redisUrl);
const webhookQueue = Bull("webhook-delivery", redisUrl);
const refundQueue = Bull("refund-processing", redisUrl);

// Queue event listeners for monitoring
paymentQueue.on("error", (error) => {
  console.error("Payment queue error:", error);
});

webhookQueue.on("error", (error) => {
  console.error("Webhook queue error:", error);
});

refundQueue.on("error", (error) => {
  console.error("Refund queue error:", error);
});

paymentQueue.on("completed", (job) => {
  console.log(`Payment job ${job.id} completed`);
});

webhookQueue.on("completed", (job) => {
  console.log(`Webhook job ${job.id} completed`);
});

refundQueue.on("completed", (job) => {
  console.log(`Refund job ${job.id} completed`);
});

module.exports = {
  paymentQueue,
  webhookQueue,
  refundQueue,
};
