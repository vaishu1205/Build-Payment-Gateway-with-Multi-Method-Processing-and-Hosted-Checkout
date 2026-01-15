const crypto = require("crypto");

/**
 * Generate HMAC-SHA256 signature for webhook payload
 * @param {Object} payload - The webhook payload object
 * @param {string} secret - The merchant's webhook secret
 * @returns {string} - Hex-encoded signature
 */
const generateWebhookSignature = (payload, secret) => {
  const payloadString = JSON.stringify(payload);

  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadString)
    .digest("hex");

  return signature;
};

/**
 * Verify webhook signature
 * @param {Object} payload - The webhook payload object
 * @param {string} signature - The signature to verify
 * @param {string} secret - The merchant's webhook secret
 * @returns {boolean} - True if signature is valid
 */
const verifyWebhookSignature = (payload, signature, secret) => {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return signature === expectedSignature;
};

/**
 
 * @param {number} attempts 
 * @returns {Date} 
 */
const calculateNextRetry = (attempts) => {
  const testMode = process.env.WEBHOOK_RETRY_INTERVALS_TEST === "true";

  let delayMs;

  if (testMode) {
    const testIntervals = [0, 5000, 10000, 15000, 20000];
    delayMs = testIntervals[attempts] || 20000;
  } else {
    const intervals = [
      0,
      parseInt(process.env.WEBHOOK_RETRY_INTERVAL_1 || 60000),
      parseInt(process.env.WEBHOOK_RETRY_INTERVAL_2 || 300000),
      parseInt(process.env.WEBHOOK_RETRY_INTERVAL_3 || 1800000),
      parseInt(process.env.WEBHOOK_RETRY_INTERVAL_4 || 7200000),
    ];
    delayMs = intervals[attempts] || 7200000;
  }

  const nextRetry = new Date(Date.now() + delayMs);
  return nextRetry;
};

module.exports = {
  generateWebhookSignature,
  verifyWebhookSignature,
  calculateNextRetry,
};
