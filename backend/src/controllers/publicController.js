const orderService = require("../services/orderService");
const paymentService = require("../services/paymentService");
const pool = require("../config/database");

const createPaymentPublic = async (req, res) => {
  try {
    const { order_id } = req.body;

    const orderResult = await pool.query(
      "SELECT merchant_id FROM orders WHERE id = $1",
      [order_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Order not found",
        },
      });
    }

    const merchantId = orderResult.rows[0].merchant_id;

    const payment = await paymentService.createPayment(merchantId, req.body);
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

const getPaymentPublic = async (req, res) => {
  try {
    const paymentId = req.params.payment_id;

    const result = await pool.query("SELECT * FROM payments WHERE id = $1", [
      paymentId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND_ERROR",
          description: "Payment not found",
        },
      });
    }

    const payment = result.rows[0];

    const response = {
      id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      status: payment.status,
      created_at: payment.created_at.toISOString(),
      updated_at: payment.updated_at.toISOString(),
    };

    if (payment.method === "upi" && payment.vpa) {
      response.vpa = payment.vpa;
    } else if (payment.method === "card") {
      if (payment.card_network) response.card_network = payment.card_network;
      if (payment.card_last4) response.card_last4 = payment.card_last4;
    }

    if (payment.error_code) {
      response.error_code = payment.error_code;
      response.error_description = payment.error_description;
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error getting payment:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

module.exports = {
  createPaymentPublic,
  getPaymentPublic,
};
