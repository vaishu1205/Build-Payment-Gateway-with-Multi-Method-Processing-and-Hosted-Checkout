const pool = require("../config/database");

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

module.exports = {
  getStats,
  getTransactions,
};
