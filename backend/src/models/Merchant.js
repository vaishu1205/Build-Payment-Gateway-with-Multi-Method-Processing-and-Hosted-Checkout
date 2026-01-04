const pool = require("../config/database");

class Merchant {
  static async findByCredentials(apiKey, apiSecret) {
    const result = await pool.query(
      "SELECT id, name, email, api_key, api_secret, webhook_url, is_active FROM merchants WHERE api_key = $1 AND api_secret = $2",
      [apiKey, apiSecret]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query(
      "SELECT id, name, email, api_key, api_secret, webhook_url, is_active, created_at, updated_at FROM merchants WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      "SELECT id, name, email, api_key, is_active FROM merchants WHERE email = $1",
      [email]
    );
    return result.rows[0];
  }

  static async create(merchantData) {
    const { id, name, email, api_key, api_secret, webhook_url } = merchantData;
    const result = await pool.query(
      `INSERT INTO merchants (id, name, email, api_key, api_secret, webhook_url, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [id, name, email, api_key, api_secret, webhook_url]
    );
    return result.rows[0];
  }
}

module.exports = Merchant;
