import React from "react";

const OrderSummary = ({ orderData }) => {
  const formatAmount = (amount) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  return (
    <div data-test-id="order-summary" style={styles.orderSummary}>
      <h2 style={styles.title}>Complete Payment</h2>
      <div style={styles.summaryRow}>
        <span>Amount: </span>
        <span data-test-id="order-amount" style={styles.amount}>
          {formatAmount(orderData.amount)}
        </span>
      </div>
      <div style={styles.summaryRow}>
        <span>Order ID: </span>
        <span data-test-id="order-id" style={styles.orderId}>
          {orderData.id}
        </span>
      </div>
    </div>
  );
};

const styles = {
  orderSummary: {
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "1px solid #eee",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    fontSize: "16px",
    color: "#666",
  },
  amount: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#007bff",
  },
  orderId: {
    fontFamily: "monospace",
    color: "#333",
  },
};

export default OrderSummary;
