import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import TransactionTable from "../components/TransactionTable";

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiKey = localStorage.getItem("apiKey");
    const apiSecret = localStorage.getItem("apiSecret");
    const email = localStorage.getItem("merchantEmail");

    if (!email) {
      navigate("/login");
      return;
    }

    fetchTransactions(apiKey, apiSecret);
  }, [navigate]);

  const fetchTransactions = async (key, secret) => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/payments/list",
        {
          headers: {
            "X-Api-Key": key,
            "X-Api-Secret": secret,
          },
        },
      );

      setTransactions(response.data.payments || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Header title="Transactions" showBack={true} backPath="/dashboard" />

      <div style={styles.content}>
        <TransactionTable transactions={transactions} loading={loading} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: "40px",
  },
};

export default Transactions;
