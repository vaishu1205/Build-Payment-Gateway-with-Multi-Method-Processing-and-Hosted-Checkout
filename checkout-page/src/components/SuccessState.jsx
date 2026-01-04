import React from "react";

const SuccessState = ({ paymentId }) => {
  return (
    <div data-test-id="success-state" style={styles.successState}>
      <h2 style={styles.successTitle}>Payment Successful!</h2>
      <div style={styles.successInfo}>
        <span>Payment ID: </span>
        <span data-test-id="payment-id" style={styles.paymentId}>
          {paymentId}
        </span>
      </div>
      <span data-test-id="success-message" style={styles.successMessage}>
        Your payment has been processed successfully
      </span>
    </div>
  );
};

const styles = {
  successState: {
    textAlign: "center",
    padding: "40px",
  },
  successTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: "20px",
  },
  successInfo: {
    marginBottom: "15px",
  },
  paymentId: {
    fontFamily: "monospace",
    fontWeight: "bold",
    color: "#333",
  },
  successMessage: {
    fontSize: "16px",
    color: "#666",
  },
};

export default SuccessState;
