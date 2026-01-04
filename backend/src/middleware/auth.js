const pool = require("../config/database");

const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const apiSecret = req.headers["x-api-secret"];

    if (!apiKey || !apiSecret) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_ERROR",
          description: "Invalid API credentials",
        },
      });
    }

    const result = await pool.query(
      "SELECT id, name, email, is_active FROM merchants WHERE api_key = $1 AND api_secret = $2",
      [apiKey, apiSecret]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_ERROR",
          description: "Invalid API credentials",
        },
      });
    }

    const merchant = result.rows[0];

    if (!merchant.is_active) {
      return res.status(401).json({
        error: {
          code: "AUTHENTICATION_ERROR",
          description: "Merchant account is inactive",
        },
      });
    }

    req.merchant = merchant;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

module.exports = { authenticateApiKey };
