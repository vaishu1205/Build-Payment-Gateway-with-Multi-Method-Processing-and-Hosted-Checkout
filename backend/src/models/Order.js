const pool = require("../config/database");

class Order {
  static async create(orderData) {
    const { id, merchant_id, amount, currency, receipt, notes, status } =
      orderData;
    const result = await pool.query(
      `INSERT INTO orders (id, merchant_id, amount, currency, receipt, notes, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [id, merchant_id, amount, currency, receipt, notes, status]
    );
    return result.rows[0];
  }

  static async findById(orderId) {
    const result = await pool.query("SELECT * FROM orders WHERE id = $1", [
      orderId,
    ]);
    return result.rows[0];
  }

  static async findByMerchantId(merchantId) {
    const result = await pool.query(
      "SELECT * FROM orders WHERE merchant_id = $1 ORDER BY created_at DESC",
      [merchantId]
    );
    return result.rows;
  }

  static async updateStatus(orderId, status) {
    const result = await pool.query(
      "UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
      [status, orderId]
    );
    return result.rows[0];
  }
}

module.exports = Order;
