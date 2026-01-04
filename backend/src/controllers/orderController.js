const orderService = require("../services/orderService");

const createOrder = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const order = await orderService.createOrder(merchantId, req.body);
    res.status(201).json(order);
  } catch (error) {
    if (error.code) {
      return res.status(400).json({ error });
    }
    console.error("Error creating order:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

const getOrder = async (req, res) => {
  try {
    const merchantId = req.merchant.id;
    const orderId = req.params.order_id;
    const order = await orderService.getOrderById(orderId, merchantId);
    res.status(200).json(order);
  } catch (error) {
    if (error.code === "NOT_FOUND_ERROR") {
      return res.status(404).json({ error });
    }
    console.error("Error getting order:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

const getOrderPublic = async (req, res) => {
  try {
    const orderId = req.params.order_id;
    const order = await orderService.getOrderByIdPublic(orderId);
    res.status(200).json(order);
  } catch (error) {
    if (error.code === "NOT_FOUND_ERROR") {
      return res.status(404).json({ error });
    }
    console.error("Error getting order:", error);
    res.status(500).json({
      error: {
        code: "SERVER_ERROR",
        description: "Internal server error",
      },
    });
  }
};

module.exports = {
  createOrder,
  getOrder,
  getOrderPublic,
};
