const pool = require("../config/database");

/**
 * Check if idempotency key exists and return cached response
 * @param {string} key - Idempotency key
 * @param {string} merchantId - Merchant UUID
 * @returns {Object|null} - Cached response or null
 */
const checkIdempotencyKey = async (key, merchantId) => {
  if (!key) return null;

  try {
    const result = await pool.query(
      `SELECT response, expires_at 
       FROM idempotency_keys 
       WHERE key = $1 AND merchant_id = $2`,
      [key, merchantId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const record = result.rows[0];
    const now = new Date();

    if (new Date(record.expires_at) < now) {
      await pool.query(
        "DELETE FROM idempotency_keys WHERE key = $1 AND merchant_id = $2",
        [key, merchantId]
      );
      return null;
    }

    return record.response;
  } catch (error) {
    console.error("Error checking idempotency key:", error);
    return null;
  }
};

/**
 * Store idempotency key with response
 * @param {string} key - Idempotency key
 * @param {string} merchantId - Merchant UUID
 * @param {Object} response - Response to cache
 */
const storeIdempotencyKey = async (key, merchantId, response) => {
  if (!key) return;

  try {
    const expiryHours = parseInt(process.env.IDEMPOTENCY_EXPIRY_HOURS || 24);
    const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO idempotency_keys (key, merchant_id, response, created_at, expires_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
       ON CONFLICT (key, merchant_id) 
       DO UPDATE SET response = $3, expires_at = $4`,
      [key, merchantId, JSON.stringify(response), expiresAt]
    );
  } catch (error) {
    console.error("Error storing idempotency key:", error);
  }
};

module.exports = {
  checkIdempotencyKey,
  storeIdempotencyKey,
};
