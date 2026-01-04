import React, { useState } from "react";

const UPIForm = ({ orderAmount, onSubmit, errorMessage }) => {
  const [vpa, setVpa] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(vpa);
  };

  const formatAmount = (amount) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  return (
    <form data-test-id="upi-form" onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.subtitle}>UPI Payment</h3>
      <input
        data-test-id="vpa-input"
        type="text"
        placeholder="username@bank"
        value={vpa}
        onChange={(e) => setVpa(e.target.value)}
        style={styles.input}
        required
      />
      <button data-test-id="pay-button" type="submit" style={styles.payButton}>
        Pay {formatAmount(orderAmount)}
      </button>
      {errorMessage && <div style={styles.errorText}>{errorMessage}</div>}
    </form>
  );
};

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
  },
  subtitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  payButton: {
    width: "100%",
    padding: "15px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#28a745",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  errorText: {
    marginTop: "10px",
    color: "#dc3545",
    fontSize: "14px",
    textAlign: "center",
  },
};

export default UPIForm;
