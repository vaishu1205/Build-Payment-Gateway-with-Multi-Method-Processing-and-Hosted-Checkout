import React from "react";

const ErrorState = ({ errorMessage, onRetry }) => {
  return (
    <div data-test-id="error-state" style={styles.errorState}>
      <h2 style={styles.errorTitle}>Payment Failed</h2>
      <span data-test-id="error-message" style={styles.errorMessageText}>
        {errorMessage || "Payment could not be processed"}
      </span>
      <button
        data-test-id="retry-button"
        onClick={onRetry}
        style={styles.retryButton}
      >
        Try Again
      </button>
    </div>
  );
};

const styles = {
  errorState: {
    textAlign: "center",
    padding: "40px",
  },
  errorTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#dc3545",
    marginBottom: "20px",
  },
  errorMessageText: {
    display: "block",
    fontSize: "16px",
    color: "#666",
    marginBottom: "20px",
  },
  retryButton: {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default ErrorState;
