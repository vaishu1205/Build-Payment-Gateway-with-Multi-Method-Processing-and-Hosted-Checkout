const pool = require("../config/database");

class Payment {
  static async create(paymentData) {
    const {
      id,
      order_id,
      merchant_id,
      amount,
      currency,
      method,
      status,
      vpa,
      card_network,
      card_last4,
    } = paymentData;
    const result = await pool.query(
      `INSERT INTO payments (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        id,
        order_id,
        merchant_id,
        amount,
        currency,
        method,
        status,
        vpa,
        card_network,
        card_last4,
      ]
    );
    return result.rows[0];
  }

  static async findById(paymentId) {
    const result = await pool.query("SELECT * FROM payments WHERE id = $1", [
      paymentId,
    ]);
    return result.rows[0];
  }

  static async findByOrderId(orderId) {
    const result = await pool.query(
      "SELECT * FROM payments WHERE order_id = $1",
      [orderId]
    );
    return result.rows;
  }

  static async findByMerchantId(merchantId) {
    const result = await pool.query(
      "SELECT * FROM payments WHERE merchant_id = $1 ORDER BY created_at DESC",
      [merchantId]
    );
    return result.rows;
  }

  static async updateStatus(
    paymentId,
    status,
    errorCode = null,
    errorDescription = null
  ) {
    const result = await pool.query(
      `UPDATE payments 
       SET status = $1, error_code = $2, error_description = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING *`,
      [status, errorCode, errorDescription, paymentId]
    );
    return result.rows[0];
  }

  static async getStatsByMerchant(merchantId) {
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
    return result.rows[0];
  }
}

module.exports = Payment;
