const pool = require("../config/database");
const { generateId } = require("../utils/validators");
const { refundQueue } = require("../config/queue");

const createRefund = async (paymentId, merchantId, refundData) => {
  const { amount, reason } = refundData;

  // Fetch payment details
  const paymentResult = await pool.query(
    "SELECT * FROM payments WHERE id = $1 AND merchant_id = $2",
    [paymentId, merchantId]
  );

  if (paymentResult.rows.length === 0) {
    throw {
      code: "NOT_FOUND_ERROR",
      description: "Payment not found",
    };
  }

  const payment = paymentResult.rows[0];

  // Verify payment is refundable
  if (payment.status !== "success") {
    throw {
      code: "BAD_REQUEST_ERROR",
      description: "Payment not in refundable state",
    };
  }

  // Calculate total already refunded
  const refundsResult = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) as total_refunded 
     FROM refunds 
     WHERE payment_id = $1 AND status IN ('pending', 'processed')`,
    [paymentId]
  );

  const totalRefunded = parseInt(refundsResult.rows[0].total_refunded);
  const availableAmount = payment.amount - totalRefunded;

  // Validate refund amount
  if (!amount || amount <= 0) {
    throw {
      code: "BAD_REQUEST_ERROR",
      description: "Refund amount must be greater than 0",
    };
  }

  if (amount > availableAmount) {
    throw {
      code: "INSUFFICIENT_REFUND_AMOUNT",
      description: "Refund amount exceeds available amount",
    };
  }

  // Generate refund ID
  let refundId;
  let isUnique = false;

  while (!isUnique) {
    refundId = generateId("rfnd_");
    const checkResult = await pool.query(
      "SELECT id FROM refunds WHERE id = $1",
      [refundId]
    );
    if (checkResult.rows.length === 0) {
      isUnique = true;
    }
  }

  // Create refund record
  const result = await pool.query(
    `INSERT INTO refunds (id, payment_id, merchant_id, amount, reason, status, created_at)
     VALUES ($1, $2, $3, $4, $5, 'pending', CURRENT_TIMESTAMP)
     RETURNING *`,
    [refundId, paymentId, merchantId, amount, reason]
  );

  const refund = result.rows[0];

  // Enqueue refund processing job
  await refundQueue.add({
    refundId: refund.id,
  });

  console.log(`Refund ${refund.id} queued for processing`);

  return {
    id: refund.id,
    payment_id: refund.payment_id,
    amount: refund.amount,
    reason: refund.reason,
    status: refund.status,
    created_at: refund.created_at.toISOString(),
  };
};

const getRefundById = async (refundId, merchantId) => {
  const result = await pool.query(
    "SELECT * FROM refunds WHERE id = $1 AND merchant_id = $2",
    [refundId, merchantId]
  );

  if (result.rows.length === 0) {
    throw {
      code: "NOT_FOUND_ERROR",
      description: "Refund not found",
    };
  }

  const refund = result.rows[0];

  const response = {
    id: refund.id,
    payment_id: refund.payment_id,
    amount: refund.amount,
    reason: refund.reason,
    status: refund.status,
    created_at: refund.created_at.toISOString(),
  };

  if (refund.processed_at) {
    response.processed_at = refund.processed_at.toISOString();
  }

  return response;
};

module.exports = {
  createRefund,
  getRefundById,
};
