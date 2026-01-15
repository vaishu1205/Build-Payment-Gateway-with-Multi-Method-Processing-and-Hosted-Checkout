const pool = require("../config/database");
const { generateId } = require("../utils/validators");
const { createWebhookLog } = require("../services/webhookService");

const getStats = async (req, res) => {
  try {
    const merchantId = req.merchant.id;

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) as total_amount,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_payments,
        COUNT(*) as total_payments
       FROM payments 
       WHERE merchant_id = $1`,
      [merchantId]
    );

    const stats = result.rows[0];

    res.status(200).json({
      total_transactions: stats.total_transactions || "0",
      total_amount: stats.total_amount || "0",
      successful_payments: stats.successful_payments || "0",
      total_payments: stats.total_payments || "0",
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const merchantId = req.merchant.id;

    const result = await pool.query(
      "SELECT * FROM payments WHERE merchant_id = $1 ORDER BY created_at DESC",
      [merchantId]
    );

    const payments = result.rows.map((payment) => ({
      id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      vpa: payment.vpa,
      card_network: payment.card_network,
      card_last4: payment.card_last4,
      created_at: payment.created_at.toISOString(),
      updated_at: payment.updated_at.toISOString(),
    }));

    res.status(200).json({
      payments: payments,
    });
  } catch (error) {
    console.error("Error getting transactions:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

// NEW: Get webhook configuration
const getWebhookConfig = async (req, res) => {
  try {
    const merchantId = req.merchant.id;

    const result = await pool.query(
      "SELECT webhook_url, webhook_secret FROM merchants WHERE id = $1",
      [merchantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Merchant not found",
        },
      });
    }

    const merchant = result.rows[0];

    res.status(200).json({
      webhook_url: merchant.webhook_url,
      webhook_secret: merchant.webhook_secret,
    });
  } catch (error) {
    console.error("Error getting webhook config:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

// NEW: Update webhook configuration
const updateWebhookConfig = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const { webhook_url, regenerate_secret } = req.body;

    let webhookSecret = null;

    // Generate new secret if requested
    if (regenerate_secret) {
      webhookSecret = "whsec_" + generateId("").substring(4, 20);
    }

    // Update webhook URL and/or secret
    if (webhookSecret) {
      await pool.query(
        "UPDATE merchants SET webhook_url = $1, webhook_secret = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
        [webhook_url, webhookSecret, merchantId]
      );
    } else {
      await pool.query(
        "UPDATE merchants SET webhook_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [webhook_url, merchantId]
      );
    }

    // Fetch updated config
    const result = await pool.query(
      "SELECT webhook_url, webhook_secret FROM merchants WHERE id = $1",
      [merchantId]
    );

    res.status(200).json({
      webhook_url: result.rows[0].webhook_url,
      webhook_secret: result.rows[0].webhook_secret,
      message: "Webhook configuration updated successfully",
    });
  } catch (error) {
    console.error("Error updating webhook config:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

// NEW: Test webhook endpoint
const testWebhook = async (req, res) => {
  try {
    const merchantId = req.merchant.id;

    // Create a test webhook event
    const testPayload = {
      payment: {
        id: "pay_test_" + Date.now(),
        order_id: "order_test_" + Date.now(),
        amount: 10000,
        currency: "INR",
        method: "test",
        status: "success",
        created_at: new Date().toISOString(),
      },
    };

    await createWebhookLog(merchantId, "payment.test", testPayload);

    res.status(200).json({
      message: "Test webhook sent",
      event: "payment.test",
    });
  } catch (error) {
    console.error("Error sending test webhook:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

module.exports = {
  getStats,
  getTransactions,
  getWebhookConfig,
  updateWebhookConfig,
  testWebhook,
};
