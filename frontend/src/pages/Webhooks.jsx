import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";

const Webhooks = () => {
  const navigate = useNavigate();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const apiKey = localStorage.getItem("apiKey");
    const apiSecret = localStorage.getItem("apiSecret");
    const email = localStorage.getItem("merchantEmail");

    if (!email) {
      navigate("/login");
      return;
    }

    fetchWebhookConfig(apiKey, apiSecret);
    fetchWebhookLogs(apiKey, apiSecret);
  }, [navigate]);

  const fetchWebhookConfig = async (key, secret) => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/merchant/webhook",
        {
          headers: {
            "X-Api-Key": key,
            "X-Api-Secret": secret,
          },
        },
      );

      setWebhookUrl(response.data.webhook_url || "");
      setWebhookSecret(response.data.webhook_secret || "");
    } catch (error) {
      console.error("Error fetching webhook config:", error);
    }
  };

  const fetchWebhookLogs = async (key, secret) => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/webhooks?limit=20",
        {
          headers: {
            "X-Api-Key": key,
            "X-Api-Secret": secret,
          },
        },
      );

      setWebhookLogs(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching webhook logs:", error);
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    const apiKey = localStorage.getItem("apiKey");
    const apiSecret = localStorage.getItem("apiSecret");

    try {
      await axios.post(
        "http://localhost:8000/api/v1/merchant/webhook",
        { webhook_url: webhookUrl },
        {
          headers: {
            "X-Api-Key": apiKey,
            "X-Api-Secret": apiSecret,
          },
        },
      );

      setMessage("Webhook configuration saved successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving webhook config:", error);
      setMessage("Error saving configuration");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleRegenerateSecret = async () => {
    const apiKey = localStorage.getItem("apiKey");
    const apiSecret = localStorage.getItem("apiSecret");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/merchant/webhook",
        { webhook_url: webhookUrl, regenerate_secret: true },
        {
          headers: {
            "X-Api-Key": apiKey,
            "X-Api-Secret": apiSecret,
          },
        },
      );

      setWebhookSecret(response.data.webhook_secret);
      setMessage("Webhook secret regenerated successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error regenerating secret:", error);
      setMessage("Error regenerating secret");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleTestWebhook = async () => {
    const apiKey = localStorage.getItem("apiKey");
    const apiSecret = localStorage.getItem("apiSecret");

    try {
      await axios.post(
        "http://localhost:8000/api/v1/merchant/webhook/test",
        {},
        {
          headers: {
            "X-Api-Key": apiKey,
            "X-Api-Secret": apiSecret,
          },
        },
      );

      setMessage("Test webhook sent");
      setTimeout(() => {
        setMessage("");
        fetchWebhookLogs(apiKey, apiSecret);
      }, 2000);
    } catch (error) {
      console.error("Error sending test webhook:", error);
      setMessage("Error sending test webhook");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleRetryWebhook = async (webhookId) => {
    const apiKey = localStorage.getItem("apiKey");
    const apiSecret = localStorage.getItem("apiSecret");

    try {
      await axios.post(
        `http://localhost:8000/api/v1/webhooks/${webhookId}/retry`,
        {},
        {
          headers: {
            "X-Api-Key": apiKey,
            "X-Api-Secret": apiSecret,
          },
        },
      );

      setMessage("Webhook retry scheduled");
      setTimeout(() => {
        setMessage("");
        fetchWebhookLogs(apiKey, apiSecret);
      }, 2000);
    } catch (error) {
      console.error("Error retrying webhook:", error);
      setMessage("Error retrying webhook");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "#28a745";
      case "failed":
        return "#dc3545";
      case "pending":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  return (
    <div style={styles.container}>
      <Header
        title="Webhook Configuration"
        showBack={true}
        backPath="/dashboard"
      />

      <div style={styles.content}>
        <div data-test-id="webhook-config" style={styles.configSection}>
          <h2 style={styles.sectionTitle}>Webhook Configuration</h2>

          {message && <div style={styles.message}>{message}</div>}

          <form
            data-test-id="webhook-config-form"
            onSubmit={handleSaveConfig}
            style={styles.form}
          >
            <div style={styles.formGroup}>
              <label style={styles.label}>Webhook URL</label>
              <input
                data-test-id="webhook-url-input"
                type="url"
                placeholder="https://yoursite.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Webhook Secret</label>
              <div style={styles.secretContainer}>
                <span data-test-id="webhook-secret" style={styles.secret}>
                  {webhookSecret || "Not set"}
                </span>
                <button
                  data-test-id="regenerate-secret-button"
                  type="button"
                  onClick={handleRegenerateSecret}
                  style={styles.regenerateButton}
                >
                  Regenerate
                </button>
              </div>
            </div>

            <div style={styles.buttonGroup}>
              <button
                data-test-id="save-webhook-button"
                type="submit"
                style={styles.saveButton}
              >
                Save Configuration
              </button>
              <button
                data-test-id="test-webhook-button"
                type="button"
                onClick={handleTestWebhook}
                style={styles.testButton}
              >
                Send Test Webhook
              </button>
            </div>
          </form>
        </div>

        <div style={styles.logsSection}>
          <h3 style={styles.sectionTitle}>Webhook Logs</h3>

          {loading ? (
            <div style={styles.loading}>Loading webhook logs...</div>
          ) : (
            <div style={styles.tableContainer}>
              <table data-test-id="webhook-logs-table" style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={styles.th}>Event</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Attempts</th>
                    <th style={styles.th}>Last Attempt</th>
                    <th style={styles.th}>Response Code</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {webhookLogs.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={styles.noData}>
                        No webhook logs found
                      </td>
                    </tr>
                  ) : (
                    webhookLogs.map((log) => (
                      <tr
                        key={log.id}
                        data-test-id="webhook-log-item"
                        data-webhook-id={log.id}
                        style={styles.row}
                      >
                        <td data-test-id="webhook-event" style={styles.td}>
                          {log.event}
                        </td>
                        <td data-test-id="webhook-status" style={styles.td}>
                          <span
                            style={{
                              ...styles.statusBadge,
                              backgroundColor: getStatusColor(log.status),
                            }}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td data-test-id="webhook-attempts" style={styles.td}>
                          {log.attempts}
                        </td>
                        <td
                          data-test-id="webhook-last-attempt"
                          style={styles.td}
                        >
                          {log.last_attempt_at
                            ? formatDate(log.last_attempt_at)
                            : "-"}
                        </td>
                        <td
                          data-test-id="webhook-response-code"
                          style={styles.td}
                        >
                          {log.response_code || "-"}
                        </td>
                        <td style={styles.td}>
                          <button
                            data-test-id="retry-webhook-button"
                            data-webhook-id={log.id}
                            onClick={() => handleRetryWebhook(log.id)}
                            style={styles.retryButton}
                          >
                            Retry
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
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
  configSection: {
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
  message: {
    padding: "10px",
    marginBottom: "20px",
    backgroundColor: "#d4edda",
    border: "1px solid #c3e6cb",
    borderRadius: "4px",
    color: "#155724",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontSize: "14px",
    color: "#333",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "10px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  secretContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  secret: {
    flex: 1,
    padding: "10px",
    backgroundColor: "#f8f9fa",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: "14px",
  },
  regenerateButton: {
    padding: "10px 20px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
  },
  saveButton: {
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  testButton: {
    padding: "12px 24px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  logsSection: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    color: "#666",
  },
  tableContainer: {
    overflowX: "auto",
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
  retryButton: {
    padding: "6px 12px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
};

export default Webhooks;
