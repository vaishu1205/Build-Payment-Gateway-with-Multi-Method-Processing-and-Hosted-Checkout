import React from "react";

const TransactionTable = ({ transactions, loading }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "#28a745";
      case "failed":
        return "#dc3545";
      case "processing":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading transactions...</div>;
  }

  return (
    <div style={styles.tableContainer}>
      <table data-test-id="transactions-table" style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.th}>Payment ID</th>
            <th style={styles.th}>Order ID</th>
            <th style={styles.th}>Amount</th>
            <th style={styles.th}>Method</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Created</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="6" style={styles.noData}>
                No transactions found
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => (
              <tr
                key={transaction.id}
                data-test-id="transaction-row"
                data-payment-id={transaction.id}
                style={styles.row}
              >
                <td data-test-id="payment-id" style={styles.td}>
                  {transaction.id}
                </td>
                <td data-test-id="order-id" style={styles.td}>
                  {transaction.order_id}
                </td>
                <td data-test-id="amount" style={styles.td}>
                  {transaction.amount}
                </td>
                <td data-test-id="method" style={styles.td}>
                  {transaction.method}
                </td>
                <td data-test-id="status" style={styles.td}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(transaction.status),
                    }}
                  >
                    {transaction.status}
                  </span>
                </td>
                <td data-test-id="created-at" style={styles.td}>
                  {formatDate(transaction.created_at)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  loading: {
    textAlign: "center",
    fontSize: "18px",
    color: "#666",
    padding: "40px",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  headerRow: {
    backgroundColor: "#f8f9fa",
  },
  th: {
    padding: "15px",
    textAlign: "left",
    fontWeight: "bold",
    color: "#333",
    borderBottom: "2px solid #dee2e6",
  },
  row: {
    borderBottom: "1px solid #dee2e6",
  },
  td: {
    padding: "15px",
    color: "#666",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: "12px",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold",
    display: "inline-block",
  },
  noData: {
    textAlign: "center",
    padding: "40px",
    color: "#999",
  },
};

export default TransactionTable;
