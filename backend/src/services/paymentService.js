const pool = require("../config/database");
const {
  generateId,
  validateVPA,
  luhnAlgorithm,
  detectCardNetwork,
  validateCardExpiry,
} = require("../utils/validators");
const { paymentQueue } = require("../config/queue");
const {
  checkIdempotencyKey,
  storeIdempotencyKey,
} = require("../utils/idempotency");

const createPayment = async (
  merchantId,
  paymentData,
  idempotencyKey = null
) => {
  // Check idempotency key
  if (idempotencyKey) {
    const cachedResponse = await checkIdempotencyKey(
      idempotencyKey,
      merchantId
    );
    if (cachedResponse) {
      console.log(
        "Returning cached response for idempotency key:",
        idempotencyKey
      );
      return cachedResponse;
    }
  }

  const { order_id, method, vpa, card } = paymentData;

  const orderResult = await pool.query(
    "SELECT * FROM orders WHERE id = $1 AND merchant_id = $2",
    [order_id, merchantId]
  );

  if (orderResult.rows.length === 0) {
    throw {
      code: "NOT_FOUND_ERROR",
      description: "Order not found",
    };
  }

  const order = orderResult.rows[0];

  let cardNetwork = null;
  let cardLast4 = null;
  let validatedVpa = null;

  if (method === "upi") {
    if (!vpa) {
      throw {
        code: "BAD_REQUEST_ERROR",
        description: "VPA is required for UPI payments",
      };
    }

    if (!validateVPA(vpa)) {
      throw {
        code: "INVALID_VPA",
        description: "Invalid VPA format",
      };
    }

    validatedVpa = vpa;
  } else if (method === "card") {
    if (
      !card ||
      !card.number ||
      !card.expiry_month ||
      !card.expiry_year ||
      !card.cvv ||
      !card.holder_name
    ) {
      throw {
        code: "BAD_REQUEST_ERROR",
        description: "Card details are required for card payments",
      };
    }

    if (!luhnAlgorithm(card.number)) {
      throw {
        code: "INVALID_CARD",
        description: "Invalid card number",
      };
    }

    if (!validateCardExpiry(card.expiry_month, card.expiry_year)) {
      throw {
        code: "EXPIRED_CARD",
        description: "Card has expired",
      };
    }

    const cleanedNumber = card.number.replace(/[\s-]/g, "");
    cardNetwork = detectCardNetwork(cleanedNumber);
    cardLast4 = cleanedNumber.slice(-4);
  } else {
    throw {
      code: "BAD_REQUEST_ERROR",
      description: "Invalid payment method",
    };
  }

  let paymentId;
  let isUnique = false;

  while (!isUnique) {
    paymentId = generateId("pay_");
    const checkResult = await pool.query(
      "SELECT id FROM payments WHERE id = $1",
      [paymentId]
    );
    if (checkResult.rows.length === 0) {
      isUnique = true;
    }
  }

  // Create payment with 'pending' status (changed from 'processing' for Deliverable 2)
  const result = await pool.query(
    `
    INSERT INTO payments (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *
  `,
    [
      paymentId,
      order_id,
      merchantId,
      order.amount,
      order.currency,
      method,
      validatedVpa,
      cardNetwork,
      cardLast4,
    ]
  );

  const payment = result.rows[0];

  // Enqueue payment processing job (async processing for Deliverable 2)
  await paymentQueue.add({
    paymentId: payment.id,
    method: payment.method,
  });

  console.log(`Payment ${payment.id} queued for processing`);

  const response = {
    id: payment.id,
    order_id: payment.order_id,
    amount: payment.amount,
    currency: payment.currency,
    method: payment.method,
    status: payment.status, // Will be 'pending'
    created_at: payment.created_at.toISOString(),
  };

  if (method === "upi") {
    response.vpa = payment.vpa;
  } else if (method === "card") {
    response.card_network = payment.card_network;
    response.card_last4 = payment.card_last4;
  }

  // Store idempotency key with response
  if (idempotencyKey) {
    await storeIdempotencyKey(idempotencyKey, merchantId, response);
  }

  return response;
};

const getPaymentById = async (paymentId, merchantId) => {
  const result = await pool.query(
    "SELECT * FROM payments WHERE id = $1 AND merchant_id = $2",
    [paymentId, merchantId]
  );

  if (result.rows.length === 0) {
    throw {
      code: "NOT_FOUND_ERROR",
      description: "Payment not found",
    };
  }

  const payment = result.rows[0];

  const response = {
    id: payment.id,
    order_id: payment.order_id,
    amount: payment.amount,
    currency: payment.currency,
    method: payment.method,
    status: payment.status,
    captured: payment.captured || false,
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

  return response;
};

const capturePayment = async (paymentId, merchantId, amount) => {
  const result = await pool.query(
    "SELECT * FROM payments WHERE id = $1 AND merchant_id = $2",
    [paymentId, merchantId]
  );

  if (result.rows.length === 0) {
    throw {
      code: "NOT_FOUND_ERROR",
      description: "Payment not found",
    };
  }

  const payment = result.rows[0];

  if (payment.status !== "success") {
    throw {
      code: "BAD_REQUEST_ERROR",
      description: "Payment not in capturable state",
    };
  }

  if (payment.captured) {
    throw {
      code: "BAD_REQUEST_ERROR",
      description: "Payment already captured",
    };
  }

  if (amount && amount !== payment.amount) {
    throw {
      code: "BAD_REQUEST_ERROR",
      description: "Capture amount must match payment amount",
    };
  }

  await pool.query(
    `UPDATE payments 
     SET captured = true, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1`,
    [paymentId]
  );

  return await getPaymentById(paymentId, merchantId);
};

module.exports = {
  createPayment,
  getPaymentById,
  capturePayment,
};
