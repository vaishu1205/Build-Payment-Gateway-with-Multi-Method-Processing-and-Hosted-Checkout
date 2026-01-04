const pool = require("../config/database");

const getTestMerchant = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, api_key FROM merchants WHERE email = $1",
      [process.env.TEST_MERCHANT_EMAIL]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Test merchant not found",
        },
      });
    }

    const merchant = result.rows[0];

    res.status(200).json({
      id: merchant.id,
      email: merchant.email,
      api_key: merchant.api_key,
      seeded: true,
    });
  } catch (error) {
    console.error("Error getting test merchant:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

module.exports = {
  getTestMerchant,
};
