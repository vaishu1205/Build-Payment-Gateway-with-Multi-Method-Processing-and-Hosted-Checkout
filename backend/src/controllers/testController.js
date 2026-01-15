const pool = require("../config/database");
const { paymentQueue, webhookQueue, refundQueue } = require("../config/queue");

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

// NEW: Get job queue status
const getJobStatus = async (req, res) => {
  try {
    // Get counts from all queues
    const paymentCounts = await paymentQueue.getJobCounts();
    const webhookCounts = await webhookQueue.getJobCounts();
    const refundCounts = await refundQueue.getJobCounts();

    // Sum up counts across all queues
    const pending =
      (paymentCounts.waiting || 0) +
      (webhookCounts.waiting || 0) +
      (refundCounts.waiting || 0) +
      (paymentCounts.delayed || 0) +
      (webhookCounts.delayed || 0) +
      (refundCounts.delayed || 0);

    const processing =
      (paymentCounts.active || 0) +
      (webhookCounts.active || 0) +
      (refundCounts.active || 0);

    const completed =
      (paymentCounts.completed || 0) +
      (webhookCounts.completed || 0) +
      (refundCounts.completed || 0);

    const failed =
      (paymentCounts.failed || 0) +
      (webhookCounts.failed || 0) +
      (refundCounts.failed || 0);

    // Check if worker is running by checking if there are active jobs or recent completions
    const workerStatus =
      processing > 0 || completed > 0 ? "running" : "stopped";

    res.status(200).json({
      pending,
      processing,
      completed,
      failed,
      worker_status: workerStatus,
    });
  } catch (error) {
    console.error("Error getting job status:", error);
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
  getJobStatus,
};
