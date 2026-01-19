import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import CredentialsBox from "../components/CredentialsBox";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    successRate: 0,
  });
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    const storedApiSecret = localStorage.getItem("apiSecret");
    const email = localStorage.getItem("merchantEmail");

    if (!email) {
      navigate("/login");
      return;
    }

    setApiKey(storedApiKey);
    setApiSecret(storedApiSecret);

    fetchStats(storedApiKey, storedApiSecret);
  }, [navigate]);

  const fetchStats = async (key, secret) => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/payments/stats",
        {
          headers: {
            "X-Api-Key": key,
            "X-Api-Secret": secret,
          },
        },
      );

      const data = response.data;
      setStats({
        totalTransactions: parseInt(data.total_transactions) || 0,
        totalAmount: parseInt(data.total_amount) || 0,
        successRate:
          data.total_payments > 0
            ? Math.round(
                (parseInt(data.successful_payments) /
                  parseInt(data.total_payments)) *
                  100,
              )
            : 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${(amount / 100).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div style={styles.container}>
      <Header title="Payment Gateway Dashboard" showLogout={true} />

      <div data-test-id="dashboard" style={styles.content}>
        <CredentialsBox apiKey={apiKey} apiSecret={apiSecret} />

        <div data-test-id="stats-container" style={styles.statsContainer}>
          <StatCard
            label="Total Transactions"
            value={stats.totalTransactions}
            testId="total-transactions"
          />
          <StatCard
            label="Total Amount"
            value={formatCurrency(stats.totalAmount)}
            testId="total-amount"
          />
          <StatCard
            label="Success Rate"
            value={`${stats.successRate}%`}
            testId="success-rate"
          />
        </div>

        <div style={styles.navigation}>
          <button
            onClick={() => navigate("/dashboard/transactions")}
            style={styles.navButton}
          >
            View Transactions
          </button>
          <button
            onClick={() => navigate("/dashboard/webhooks")}
            style={styles.navButton}
          >
            Webhook Configuration
          </button>
          <button
            onClick={() => navigate("/dashboard/docs")}
            style={styles.navButton}
          >
            API Documentation
          </button>
        </div>
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
    maxWidth: "1200px",
    margin: "0 auto",
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  navigation: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
  },
  navButton: {
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default Dashboard;
