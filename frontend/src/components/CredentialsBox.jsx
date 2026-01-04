import React from "react";

const CredentialsBox = ({ apiKey, apiSecret }) => {
  return (
    <div data-test-id="api-credentials" style={styles.credentialsBox}>
      <h2 style={styles.sectionTitle}>API Credentials</h2>
      <div style={styles.credentialItem}>
        <label style={styles.label}>API Key</label>
        <span data-test-id="api-key" style={styles.credentialValue}>
          {apiKey}
        </span>
      </div>
      <div style={styles.credentialItem}>
        <label style={styles.label}>API Secret</label>
        <span data-test-id="api-secret" style={styles.credentialValue}>
          {apiSecret}
        </span>
      </div>
    </div>
  );
};

const styles = {
  credentialsBox: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
  },
  credentialItem: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    color: "#666",
    marginBottom: "5px",
  },
  credentialValue: {
    display: "block",
    fontSize: "16px",
    fontFamily: "monospace",
    color: "#333",
    backgroundColor: "#f8f9fa",
    padding: "10px",
    borderRadius: "4px",
  },
};

export default CredentialsBox;
