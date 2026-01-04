import React from "react";

const Success = () => {
  return (
    <div style={styles.container}>
      <div style={styles.successBox}>
        <h1 style={styles.title}>Payment Successful!</h1>
        <p style={styles.message}>
          Your payment has been processed successfully.
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
  successBox: {
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
    color: "#28a745",
    marginBottom: "20px",
  },
  message: {
    fontSize: "16px",
    color: "#666",
  },
};

export default Success;
