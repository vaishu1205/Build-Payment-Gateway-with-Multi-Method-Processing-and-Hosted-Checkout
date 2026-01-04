import React from "react";

const ProcessingState = () => {
  return (
    <div data-test-id="processing-state" style={styles.processingState}>
      <div style={styles.spinner}></div>
      <span data-test-id="processing-message" style={styles.processingMessage}>
        Processing payment...
      </span>
    </div>
  );
};

const styles = {
  processingState: {
    textAlign: "center",
    padding: "40px",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #f3f3f3",
    borderTop: "5px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  processingMessage: {
    fontSize: "18px",
    color: "#666",
  },
};

export default ProcessingState;
