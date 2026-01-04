import React from "react";

const Failure = () => {
  return (
    <div style={styles.container}>
      <div style={styles.failureBox}>
        <h1 style={styles.title}>Payment Failed</h1>
        <p style={styles.message}>
          Your payment could not be processed. Please try again.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  failureBox: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: "500px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#dc3545",
    marginBottom: "20px",
  },
  message: {
    fontSize: "16px",
    color: "#666",
  },
};

export default Failure;
