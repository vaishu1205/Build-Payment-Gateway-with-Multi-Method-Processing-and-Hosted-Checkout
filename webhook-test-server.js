const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

app.post("/webhook", (req, res) => {
  console.log("\n=================================");
  console.log("📨 WEBHOOK RECEIVED!");
  console.log("=================================");

  const signature = req.headers["x-webhook-signature"];
  const payload = JSON.stringify(req.body);
  const secret = "whsec_test_abc123";

  // Verify signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const isValid = signature === expectedSignature;

  console.log("Event Type:", req.body.event);
  console.log(
    "Timestamp:",
    new Date(req.body.timestamp * 1000).toLocaleString()
  );
  console.log("Signature Valid:", isValid ? "YES" : "NO");
  console.log("\nPayment Data:");
  console.log(JSON.stringify(req.body.data, null, 2));
  console.log("=================================\n");

  // Always respond with 200 to acknowledge receipt
  res.status(200).send("OK");
});

app.listen(4000, () => {
  console.log("Webhook test server listening on http://localhost:4000");
  console.log("Waiting for webhooks...\n");
});
