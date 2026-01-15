require("dotenv").config();
const { paymentQueue, webhookQueue, refundQueue } = require("./config/queue");
const { initializeDatabase } = require("./config/schema");
const pool = require("./config/database");
const {
  createWebhookLog,
  deliverWebhook,
} = require("./services/webhookService");

// Payment processing worker
paymentQueue.process(async (job) => {
  const { paymentId, method } = job.data;

  console.log(`Processing payment: ${paymentId}`);

  try {
    // Simulate payment processing delay
    const testMode = process.env.TEST_MODE === "true";
    const delay = testMode
      ? parseInt(process.env.TEST_PROCESSING_DELAY || "1000")
      : Math.floor(
          Math.random() *
            (parseInt(process.env.PROCESSING_DELAY_MAX) -
              parseInt(process.env.PROCESSING_DELAY_MIN) +
              1)
        ) + parseInt(process.env.PROCESSING_DELAY_MIN);

    await new Promise((resolve) => setTimeout(resolve, delay));

    // Determine payment outcome
    let isSuccess;
    if (testMode) {
      isSuccess = process.env.TEST_PAYMENT_SUCCESS === "true";
    } else {
      const successRate =
        method === "upi"
          ? parseFloat(process.env.UPI_SUCCESS_RATE)
          : parseFloat(process.env.CARD_SUCCESS_RATE);
      isSuccess = Math.random() < successRate;
    }

    // Fetch payment details
    const paymentResult = await pool.query(
      "SELECT * FROM payments WHERE id = $1",
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      throw new Error("Payment not found");
    }

    const payment = paymentResult.rows[0];

    // Update payment status
    if (isSuccess) {
      await pool.query(
        `UPDATE payments 
         SET status = 'success', updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [paymentId]
      );

      console.log(`Payment ${paymentId} succeeded`);

      // Enqueue webhook for payment.success
      const webhookPayload = {
        payment: {
          id: payment.id,
          order_id: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          status: "success",
          created_at: payment.created_at.toISOString(),
        },
      };

      if (payment.method === "upi" && payment.vpa) {
        webhookPayload.payment.vpa = payment.vpa;
      } else if (payment.method === "card") {
        webhookPayload.payment.card_network = payment.card_network;
        webhookPayload.payment.card_last4 = payment.card_last4;
      }

      await createWebhookLog(
        payment.merchant_id,
        "payment.success",
        webhookPayload
      );
    } else {
      await pool.query(
        `UPDATE payments 
         SET status = 'failed', 
             error_code = 'PAYMENT_FAILED',
             error_description = 'Payment processing failed',
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [paymentId]
      );

      console.log(`Payment ${paymentId} failed`);

      // Enqueue webhook for payment.failed
      const webhookPayload = {
        payment: {
          id: payment.id,
          order_id: payment.order_id,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          status: "failed",
          error_code: "PAYMENT_FAILED",
          error_description: "Payment processing failed",
          created_at: payment.created_at.toISOString(),
        },
      };

      await createWebhookLog(
        payment.merchant_id,
        "payment.failed",
        webhookPayload
      );
    }

    return { success: isSuccess };
  } catch (error) {
    console.error(`Error processing payment ${paymentId}:`, error);
    throw error;
  }
});

// Webhook delivery worker
webhookQueue.process(async (job) => {
  const { webhookLogId, merchantId, event, payload } = job.data;

  console.log(`Delivering webhook: ${webhookLogId}, event: ${event}`);

  try {
    await deliverWebhook(webhookLogId, merchantId, event, payload);
    return { delivered: true };
  } catch (error) {
    console.error(`Error delivering webhook ${webhookLogId}:`, error);
    throw error;
  }
});

// Refund processing worker
refundQueue.process(async (job) => {
  const { refundId } = job.data;

  console.log(`Processing refund: ${refundId}`);

  try {
    // Simulate refund processing delay (3-5 seconds)
    const delay = Math.floor(Math.random() * 2000) + 3000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Fetch refund details
    const refundResult = await pool.query(
      "SELECT * FROM refunds WHERE id = $1",
      [refundId]
    );

    if (refundResult.rows.length === 0) {
      throw new Error("Refund not found");
    }

    const refund = refundResult.rows[0];

    // Update refund status
    await pool.query(
      `UPDATE refunds 
       SET status = 'processed', 
           processed_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [refundId]
    );

    console.log(`Refund ${refundId} processed`);

    // Enqueue webhook for refund.processed
    const webhookPayload = {
      refund: {
        id: refund.id,
        payment_id: refund.payment_id,
        amount: refund.amount,
        reason: refund.reason,
        status: "processed",
        created_at: refund.created_at.toISOString(),
      },
    };

    await createWebhookLog(
      refund.merchant_id,
      "refund.processed",
      webhookPayload
    );

    return { success: true };
  } catch (error) {
    console.error(`Error processing refund ${refundId}:`, error);
    throw error;
  }
});

// Initialize database and start worker
const startWorker = async () => {
  try {
    console.log("Starting payment gateway worker...");
    await initializeDatabase();
    console.log("Worker ready and listening for jobs");
  } catch (error) {
    console.error("Failed to start worker:", error);
    process.exit(1);
  }
};

startWorker();

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing worker...");
  await paymentQueue.close();
  await webhookQueue.close();
  await refundQueue.close();
  await pool.end();
  process.exit(0);
});
