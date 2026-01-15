const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { initializeDatabase } = require("./config/schema");
const routes = require("./routes");
const { paymentQueue, webhookQueue, refundQueue } = require("./config/queue");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.use("/", routes);

const startServer = async () => {
  try {
    await initializeDatabase();

    // Test Redis connection
    try {
      await paymentQueue.isReady();
      console.log("Connected to Redis successfully");
    } catch (redisError) {
      console.error("Redis connection failed:", redisError.message);
      console.log("Job queue features will be unavailable");
    }

    app.listen(PORT, () => {
      console.log(`Payment Gateway API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing server...");
  await paymentQueue.close();
  await webhookQueue.close();
  await refundQueue.close();
  process.exit(0);
});

startServer();
