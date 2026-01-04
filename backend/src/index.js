const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { initializeDatabase } = require("./config/schema");
const routes = require("./routes");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use("/", routes);

const startServer = async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`Payment Gateway API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
