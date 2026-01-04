const express = require("express");
const router = express.Router();
const { authenticateApiKey } = require("../middleware/auth");
const healthController = require("../controllers/healthController");
const orderController = require("../controllers/orderController");
const paymentController = require("../controllers/paymentController");
const merchantController = require("../controllers/merchantController");
const testController = require("../controllers/testController");
const publicController = require("../controllers/publicController");

router.get("/health", healthController.healthCheck);

// Test endpoints
router.get("/api/v1/test/merchant", testController.getTestMerchant);

// Order endpoints
router.post("/api/v1/orders", authenticateApiKey, orderController.createOrder);
router.get("/api/v1/orders/:order_id/public", orderController.getOrderPublic);
router.get(
  "/api/v1/orders/:order_id",
  authenticateApiKey,
  orderController.getOrder
);

// Payment endpoints - specific routes BEFORE parameterized routes
router.get(
  "/api/v1/payments/stats",
  authenticateApiKey,
  merchantController.getStats
);
router.get(
  "/api/v1/payments/list",
  authenticateApiKey,
  merchantController.getTransactions
);
router.post("/api/v1/payments/public", publicController.createPaymentPublic);
router.post(
  "/api/v1/payments",
  authenticateApiKey,
  paymentController.createPayment
);
router.get(
  "/api/v1/payments/:payment_id/public",
  publicController.getPaymentPublic
);
router.get(
  "/api/v1/payments/:payment_id",
  authenticateApiKey,
  paymentController.getPayment
);

module.exports = router;
