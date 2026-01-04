const pool = require("../config/database");
const { generateId } = require("../utils/validators");

const createOrder = async (merchantId, orderData) => {
  const { amount, currency = "INR", receipt, notes } = orderData;

  if (!amount || amount < 100) {
    throw {
      code: "BAD_REQUEST_ERROR",
      description: "amount must be at least 100",
    };
  }

  let orderId;
  let isUnique = false;

  while (!isUnique) {
    orderId = generateId("order_");
    const checkResult = await pool.query(
      "SELECT id FROM orders WHERE id = $1",
      [orderId]
    );
    if (checkResult.rows.length === 0) {
      isUnique = true;
    }
  }

  const result = await pool.query(
    `
    INSERT INTO orders (id, merchant_id, amount, currency, receipt, notes, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, 'created', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `,
    [
      orderId,
      merchantId,
      amount,
      currency,
      receipt,
      notes ? JSON.stringify(notes) : null,
    ]
  );

  const order = result.rows[0];

  return {
    id: order.id,
    merchant_id: order.merchant_id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    notes: order.notes,
    status: order.status,
    created_at: order.created_at.toISOString(),
  };
};

const getOrderById = async (orderId, merchantId) => {
  const result = await pool.query(
    "SELECT * FROM orders WHERE id = $1 AND merchant_id = $2",
    [orderId, merchantId]
  );

  if (result.rows.length === 0) {
    throw {
      code: "NOT_FOUND_ERROR",
      description: "Order not found",
    };
  }

  const order = result.rows[0];

  return {
    id: order.id,
    merchant_id: order.merchant_id,
    amount: order.amount,
    currency: order.currency,
    receipt: order.receipt,
    notes: order.notes,
    status: order.status,
    created_at: order.created_at.toISOString(),
    updated_at: order.updated_at.toISOString(),
  };
};

const getOrderByIdPublic = async (orderId) => {
  const result = await pool.query(
    "SELECT id, amount, currency, status FROM orders WHERE id = $1",
    [orderId]
  );

  if (result.rows.length === 0) {
    throw {
      code: "NOT_FOUND_ERROR",
      description: "Order not found",
    };
  }

  const order = result.rows[0];

  return {
    id: order.id,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
  };
};

module.exports = {
  createOrder,
  getOrderById,
  getOrderByIdPublic,
};
