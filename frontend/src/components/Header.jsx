import React from "react";
import { useNavigate } from "react-router-dom";

const Header = ({
  title,
  showLogout = false,
  showBack = false,
  backPath = "/dashboard",
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleBack = () => {
    navigate(backPath);
  };

  return (
    <div style={styles.header}>
      <h1 style={styles.title}>{title}</h1>
      <div style={styles.actions}>
        {showBack && (
          <button onClick={handleBack} style={styles.backButton}>
            Back to Dashboard
          </button>
        )}
        {showLogout && (
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  header: {
    backgroundColor: "white",
    padding: "20px 40px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    margin: 0,
  },
  actions: {
    display: "flex",
    gap: "10px",
  },
  backButton: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  logoutButton: {
    padding: "8px 16px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default Header;
