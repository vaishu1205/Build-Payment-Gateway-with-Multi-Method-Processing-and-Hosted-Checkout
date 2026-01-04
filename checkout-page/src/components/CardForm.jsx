import React, { useState } from "react";

const CardForm = ({ orderAmount, onSubmit, errorMessage }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      number: cardNumber,
      expiry_month: expiryMonth,
      expiry_year: expiryYear,
      cvv: cvv,
      holder_name: cardholderName,
    });
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 2) {
      setExpiryMonth(value);
      setExpiryYear("");
    } else {
      setExpiryMonth(value.substring(0, 2));
      setExpiryYear(value.substring(2, 4));
    }
  };

  const formatAmount = (amount) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  return (
    <form data-test-id="card-form" onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.subtitle}>Card Payment</h3>
      <input
        data-test-id="card-number-input"
        type="text"
        placeholder="Card Number"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        style={styles.input}
        required
      />
      <input
        data-test-id="expiry-input"
        type="text"
        placeholder="MM/YY"
        value={
          expiryMonth && expiryYear
            ? `${expiryMonth}/${expiryYear}`
            : expiryMonth
        }
        onChange={handleExpiryChange}
        style={styles.input}
        required
      />
      <input
        data-test-id="cvv-input"
        type="text"
        placeholder="CVV"
        value={cvv}
        onChange={(e) => setCvv(e.target.value)}
        style={styles.input}
        maxLength="4"
        required
      />
      <input
        data-test-id="cardholder-name-input"
        type="text"
        placeholder="Name on Card"
        value={cardholderName}
        onChange={(e) => setCardholderName(e.target.value)}
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

export default CardForm;
