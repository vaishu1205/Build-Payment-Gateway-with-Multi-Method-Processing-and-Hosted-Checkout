import React from "react";

const PaymentMethodSelector = ({ onSelectMethod }) => {
  return (
    <div data-test-id="payment-methods" style={styles.methodsContainer}>
      <h3 style={styles.subtitle}>Select Payment Method</h3>
      <button
        data-test-id="method-upi"
        data-method="upi"
        onClick={() => onSelectMethod("upi")}
        style={styles.methodButton}
      >
        UPI
      </button>
      <button
        data-test-id="method-card"
        data-method="card"
        onClick={() => onSelectMethod("card")}
        style={styles.methodButton}
      >
        Card
      </button>
    </div>
  );
};

const styles = {
  methodsContainer: {
    marginBottom: "20px",
  },
  subtitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
  },
  methodButton: {
    width: "100%",
    padding: "15px",
    marginBottom: "10px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#007bff",
    backgroundColor: "white",
    border: "2px solid #007bff",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default PaymentMethodSelector;
