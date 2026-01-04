import React from "react";

const StatCard = ({ label, value, testId }) => {
  return (
    <div style={styles.statCard}>
      <h3 style={styles.statLabel}>{label}</h3>
      <div data-test-id={testId} style={styles.statValue}>
        {value}
      </div>
    </div>
  );
};

const styles = {
  statCard: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  statLabel: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "10px",
    fontWeight: "normal",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#007bff",
  },
};

export default StatCard;
