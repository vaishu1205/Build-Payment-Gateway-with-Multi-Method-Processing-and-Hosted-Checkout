const paymentService = require("../services/paymentService");

const createPayment = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const idempotencyKey = req.headers["idempotency-key"] || null;

    const payment = await paymentService.createPayment(
      merchantId,
      req.body,
      idempotencyKey
    );

    res.status(201).json(payment);
  } catch (error) {
    if (error.code === "NOT_FOUND_ERROR") {
      return res.status(404).json({ error });
    }
    if (error.code) {
      return res.status(400).json({ error });
    }
    console.error("Error creating payment:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

const getPayment = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const paymentId = req.params.payment_id;
    const payment = await paymentService.getPaymentById(paymentId, merchantId);
    res.status(200).json(payment);
  } catch (error) {
    if (error.code === "NOT_FOUND_ERROR") {
      return res.status(404).json({ error });
    }
    console.error("Error getting payment:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const paymentId = req.params.payment_id;
    const { amount } = req.body;

    const payment = await paymentService.capturePayment(
      paymentId,
      merchantId,
      amount
    );

    res.status(200).json(payment);
  } catch (error) {
    if (error.code === "NOT_FOUND_ERROR") {
      return res.status(404).json({ error });
    }
    if (error.code) {
      return res.status(400).json({ error });
    }
    console.error("Error capturing payment:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

module.exports = {
  createPayment,
  getPayment,
  capturePayment,
};
