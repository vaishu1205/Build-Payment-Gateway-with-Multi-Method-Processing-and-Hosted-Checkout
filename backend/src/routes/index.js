const express = require("express");
const router = express.Router();
const { authenticateApiKey } = require("../middleware/auth");
const healthController = require("../controllers/healthController");
const orderController = require("../controllers/orderController");
const paymentController = require("../controllers/paymentController");
const merchantController = require("../controllers/merchantController");
const testController = require("../controllers/testController");
const publicController = require("../controllers/publicController");
const refundController = require("../controllers/refundController");
const webhookController = require("../controllers/webhookController");

router.get("/health", healthController.healthCheck);

router.get("/api/v1/test/merchant", testController.getTestMerchant);
router.get("/api/v1/test/jobs/status", testController.getJobStatus);

router.post("/api/v1/orders", authenticateApiKey, orderController.createOrder);
router.get("/api/v1/orders/:order_id/public", orderController.getOrderPublic);
router.get(
  "/api/v1/orders/:order_id",
  authenticateApiKey,
  orderController.getOrder
);

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

router.post(
  "/api/v1/payments/:payment_id/capture",
  authenticateApiKey,
  paymentController.capturePayment
);

router.post(
  "/api/v1/payments/:payment_id/refunds",
  authenticateApiKey,
  refundController.createRefund
);
router.get(
  "/api/v1/refunds/:refund_id",
  authenticateApiKey,
  refundController.getRefund
);

router.get(
  "/api/v1/webhooks",
  authenticateApiKey,
  webhookController.listWebhooks
);
router.post(
  "/api/v1/webhooks/:webhook_id/retry",
  authenticateApiKey,
  webhookController.retryWebhook
);

router.get(
  "/api/v1/merchant/webhook",
  authenticateApiKey,
  merchantController.getWebhookConfig
);
router.post(
  "/api/v1/merchant/webhook",
  authenticateApiKey,
  merchantController.updateWebhookConfig
);
router.post(
  "/api/v1/merchant/webhook/test",
  authenticateApiKey,
  merchantController.testWebhook
);

module.exports = router;
