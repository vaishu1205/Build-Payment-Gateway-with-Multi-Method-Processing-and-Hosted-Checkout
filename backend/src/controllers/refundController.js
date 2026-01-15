const refundService = require("../services/refundService");

const createRefund = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const paymentId = req.params.payment_id;

    const refund = await refundService.createRefund(
      paymentId,
      merchantId,
      req.body
    );

    res.status(201).json(refund);
  } catch (error) {
    if (error.code === "NOT_FOUND_ERROR") {
      return res.status(404).json({ error });
    }
    if (error.code) {
      return res.status(400).json({ error });
    }
    console.error("Error creating refund:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

const getRefund = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const refundId = req.params.refund_id;

    const refund = await refundService.getRefundById(refundId, merchantId);

    res.status(200).json(refund);
  } catch (error) {
    if (error.code === "NOT_FOUND_ERROR") {
      return res.status(404).json({ error });
    }
    console.error("Error getting refund:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

module.exports = {
  createRefund,
  getRefund,
};
