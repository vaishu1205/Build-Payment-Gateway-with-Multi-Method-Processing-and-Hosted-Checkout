const pool = require("../config/database");
const axios = require("axios");
const {
  generateWebhookSignature,
  calculateNextRetry,
} = require("../utils/webhook");
const { webhookQueue } = require("../config/queue");

const createWebhookLog = async (merchantId, event, payload) => {
  try {
    const result = await pool.query(
      `INSERT INTO webhook_logs (merchant_id, event, payload, status, attempts, created_at)
       VALUES ($1, $2, $3, 'pending', 0, CURRENT_TIMESTAMP)
       RETURNING *`,
      [merchantId, event, JSON.stringify(payload)]
    );

    const webhookLog = result.rows[0];

    await webhookQueue.add({
      webhookLogId: webhookLog.id,
      merchantId: merchantId,
      event: event,
      payload: payload,
    });

    console.log(`Webhook ${webhookLog.id} queued for delivery`);

    return webhookLog;
  } catch (error) {
    console.error("Error creating webhook log:", error);
    throw error;
  }
};

const deliverWebhook = async (webhookLogId, merchantId, event, payload) => {
  try {
    const merchantResult = await pool.query(
      "SELECT webhook_url, webhook_secret FROM merchants WHERE id = $1",
      [merchantId]
    );

    if (merchantResult.rows.length === 0) {
      console.error("Merchant not found:", merchantId);
      return;
    }

    const merchant = merchantResult.rows[0];

    if (!merchant.webhook_url) {
      console.log("Webhook URL not configured for merchant:", merchantId);
      await pool.query(
        `UPDATE webhook_logs 
         SET status = 'failed', 
             response_body = 'Webhook URL not configured' 
         WHERE id = $1`,
        [webhookLogId]
      );
      return;
    }

    const logResult = await pool.query(
      "SELECT * FROM webhook_logs WHERE id = $1",
      [webhookLogId]
    );

    if (logResult.rows.length === 0) {
      console.error("Webhook log not found:", webhookLogId);
      return;
    }

    const webhookLog = logResult.rows[0];
    const currentAttempts = webhookLog.attempts;

    const webhookPayload = {
      event: event,
      timestamp: Math.floor(Date.now() / 1000),
      data: payload,
    };

    const signature = generateWebhookSignature(
      webhookPayload,
      merchant.webhook_secret
    );

    let responseCode = null;
    let responseBody = null;
    let deliverySuccess = false;

    try {
      const response = await axios.post(merchant.webhook_url, webhookPayload, {
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Signature": signature,
        },
        timeout: 5000,
      });

      responseCode = response.status;
      responseBody = JSON.stringify(response.data);
      deliverySuccess = response.status >= 200 && response.status < 300;

      console.log(
        `Webhook delivered to ${merchant.webhook_url}, status: ${responseCode}`
      );
    } catch (error) {
      if (error.response) {
        responseCode = error.response.status;
        responseBody = JSON.stringify(error.response.data);
      } else {
        responseCode = 0;
        responseBody = error.message;
      }
      console.error(`Webhook delivery failed: ${error.message}`);
    }

    const newAttempts = currentAttempts + 1;

    if (deliverySuccess) {
      await pool.query(
        `UPDATE webhook_logs 
         SET status = 'success', 
             attempts = $1, 
             last_attempt_at = CURRENT_TIMESTAMP,
             response_code = $2,
             response_body = $3
         WHERE id = $4`,
        [newAttempts, responseCode, responseBody, webhookLogId]
      );
    } else {
      if (newAttempts >= 5) {
        await pool.query(
          `UPDATE webhook_logs 
           SET status = 'failed', 
               attempts = $1, 
               last_attempt_at = CURRENT_TIMESTAMP,
               response_code = $2,
               response_body = $3
           WHERE id = $4`,
          [newAttempts, responseCode, responseBody, webhookLogId]
        );
        console.log(
          `Webhook ${webhookLogId} permanently failed after 5 attempts`
        );
      } else {
        const nextRetry = calculateNextRetry(newAttempts);

        await pool.query(
          `UPDATE webhook_logs 
           SET status = 'pending', 
               attempts = $1, 
               last_attempt_at = CURRENT_TIMESTAMP,
               next_retry_at = $2,
               response_code = $3,
               response_body = $4
           WHERE id = $5`,
          [newAttempts, nextRetry, responseCode, responseBody, webhookLogId]
        );

        const delayMs = nextRetry.getTime() - Date.now();
        await webhookQueue.add(
          {
            webhookLogId: webhookLogId,
            merchantId: merchantId,
            event: event,
            payload: payload,
          },
          {
            delay: delayMs,
          }
        );

        console.log(
          `Webhook ${webhookLogId} scheduled for retry ${
            newAttempts + 1
          } at ${nextRetry}`
        );
      }
    }
  } catch (error) {
    console.error("Error delivering webhook:", error);
  }
};

const listWebhookLogs = async (merchantId, limit = 10, offset = 0) => {
  const result = await pool.query(
    `SELECT id, event, status, attempts, created_at, last_attempt_at, response_code
     FROM webhook_logs 
     WHERE merchant_id = $1 
     ORDER BY created_at DESC 
     LIMIT $2 OFFSET $3`,
    [merchantId, limit, offset]
  );

  const countResult = await pool.query(
    "SELECT COUNT(*) FROM webhook_logs WHERE merchant_id = $1",
    [merchantId]
  );

  const total = parseInt(countResult.rows[0].count);

  const data = result.rows.map((row) => ({
    id: row.id,
    event: row.event,
    status: row.status,
    attempts: row.attempts,
    created_at: row.created_at.toISOString(),
    last_attempt_at: row.last_attempt_at
      ? row.last_attempt_at.toISOString()
      : null,
    response_code: row.response_code,
  }));

  return {
    data,
    total,
    limit,
    offset,
  };
};

const retryWebhook = async (webhookLogId, merchantId) => {
  const result = await pool.query(
    "SELECT * FROM webhook_logs WHERE id = $1 AND merchant_id = $2",
    [webhookLogId, merchantId]
  );

  if (result.rows.length === 0) {
    throw {
      code: "NOT_FOUND_ERROR",
      description: "Webhook log not found",
    };
  }

  const webhookLog = result.rows[0];

  // Reset attempts and status
  await pool.query(
    `UPDATE webhook_logs 
     SET status = 'pending', 
         attempts = 0, 
         next_retry_at = NULL 
     WHERE id = $1`,
    [webhookLogId]
  );

  await webhookQueue.add({
    webhookLogId: webhookLog.id,
    merchantId: merchantId,
    event: webhookLog.event,
    payload: webhookLog.payload,
  });

  return {
    id: webhookLog.id,
    status: "pending",
    message: "Webhook retry scheduled",
  };
};

module.exports = {
  createWebhookLog,
  deliverWebhook,
  listWebhookLogs,
  retryWebhook,
};
