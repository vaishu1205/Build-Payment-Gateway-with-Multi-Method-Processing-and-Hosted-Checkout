import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const ApiDocs = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <Header title="API Documentation" showBack={true} backPath="/dashboard" />

      <div data-test-id="api-docs" style={styles.content}>
        <section data-test-id="section-create-order" style={styles.section}>
          <h3 style={styles.sectionTitle}>1. Create Order</h3>
          <p style={styles.description}>
            Create a payment order to initiate a transaction. The order
            represents the payment intent.
          </p>
          <pre
            data-test-id="code-snippet-create-order"
            style={styles.codeBlock}
          >
            <code>{`curl -X POST http://localhost:8000/api/v1/orders \\
  -H "X-Api-Key: key_test_abc123" \\
  -H "X-Api-Secret: secret_test_xyz789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 50000,
    "currency": "INR",
    "receipt": "receipt_123"
  }'`}</code>
          </pre>
          <p style={styles.note}>
            <strong>Note:</strong> Amount is in paise (smallest currency unit).
            50000 paise = ₹500.00
          </p>
        </section>

        <section data-test-id="section-sdk-integration" style={styles.section}>
          <h3 style={styles.sectionTitle}>2. SDK Integration</h3>
          <p style={styles.description}>
            Integrate the payment gateway on your website using our JavaScript
            SDK. The SDK opens a modal for customers to complete payment.
          </p>
          <pre data-test-id="code-snippet-sdk" style={styles.codeBlock}>
            <code>{`<!-- Include the SDK -->
<script src="http://localhost:3001/checkout.js"></script>

<!-- Add a payment button -->
<button id="pay-button">Pay Now</button>

<script>
document.getElementById('pay-button').addEventListener('click', function() {
  const checkout = new PaymentGateway({
    key: 'key_test_abc123',
    orderId: 'order_xyz',
    onSuccess: function(response) {
      console.log('Payment ID:', response.paymentId);
      // Handle successful payment
    },
    onFailure: function(error) {
      console.log('Payment failed:', error);
      // Handle payment failure
    },
    onClose: function() {
      console.log('Modal closed');
    }
  });
  
  checkout.open();
});
</script>`}</code>
          </pre>
        </section>

        <section
          data-test-id="section-webhook-verification"
          style={styles.section}
        >
          <h3 style={styles.sectionTitle}>3. Verify Webhook Signature</h3>
          <p style={styles.description}>
            Verify webhook signatures to ensure requests are coming from the
            payment gateway. Use HMAC-SHA256 to validate.
          </p>
          <pre data-test-id="code-snippet-webhook" style={styles.codeBlock}>
            <code>{`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}

// Example usage in Express
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const webhookSecret = 'whsec_test_abc123';
  
  if (!verifyWebhook(req.body, signature, webhookSecret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook event
  const event = req.body.event;
  const data = req.body.data;
  
  console.log('Webhook event:', event);
  console.log('Payment data:', data.payment);
  
  res.status(200).send('OK');
});`}</code>
          </pre>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>4. Create Payment (Direct API)</h3>
          <p style={styles.description}>
            Create a payment for an order. Supports UPI and Card payment
            methods. Payments are processed asynchronously.
          </p>
          <h4 style={styles.subTitle}>UPI Payment</h4>
          <pre style={styles.codeBlock}>
            <code>{`curl -X POST http://localhost:8000/api/v1/payments \\
  -H "X-Api-Key: key_test_abc123" \\
  -H "X-Api-Secret: secret_test_xyz789" \\
  -H "Idempotency-Key: unique_request_123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "order_id": "order_NXhj67fGH2jk9mPq",
    "method": "upi",
    "vpa": "user@paytm"
  }'`}</code>
          </pre>

          <h4 style={styles.subTitle}>Card Payment</h4>
          <pre style={styles.codeBlock}>
            <code>{`curl -X POST http://localhost:8000/api/v1/payments \\
  -H "X-Api-Key: key_test_abc123" \\
  -H "X-Api-Secret: secret_test_xyz789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "order_id": "order_NXhj67fGH2jk9mPq",
    "method": "card",
    "card": {
      "number": "4111111111111111",
      "expiry_month": "12",
      "expiry_year": "2025",
      "cvv": "123",
      "holder_name": "John Doe"
    }
  }'`}</code>
          </pre>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>5. Create Refund</h3>
          <p style={styles.description}>
            Process full or partial refunds for successful payments. Refunds are
            processed asynchronously.
          </p>
          <pre style={styles.codeBlock}>
            <code>{`curl -X POST http://localhost:8000/api/v1/payments/pay_123/refunds \\
  -H "X-Api-Key: key_test_abc123" \\
  -H "X-Api-Secret: secret_test_xyz789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 25000,
    "reason": "Customer requested partial refund"
  }'`}</code>
          </pre>
          <p style={styles.note}>
            <strong>Note:</strong> Refund amount cannot exceed the remaining
            payment amount after previous refunds.
          </p>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>6. Webhook Events</h3>
          <p style={styles.description}>
            Configure a webhook URL in your dashboard to receive real-time
            payment events.
          </p>
          <div style={styles.eventList}>
            <div style={styles.eventItem}>
              <strong>payment.success</strong> - Payment completed successfully
            </div>
            <div style={styles.eventItem}>
              <strong>payment.failed</strong> - Payment failed
            </div>
            <div style={styles.eventItem}>
              <strong>refund.processed</strong> - Refund completed
            </div>
          </div>

          <h4 style={styles.subTitle}>Webhook Payload Example</h4>
          <pre style={styles.codeBlock}>
            <code>{`{
  "event": "payment.success",
  "timestamp": 1705315870,
  "data": {
    "payment": {
      "id": "pay_H8sK3jD9s2L1pQr",
      "order_id": "order_NXhj67fGH2jk9mPq",
      "amount": 50000,
      "currency": "INR",
      "method": "upi",
      "status": "success",
      "created_at": "2024-01-15T10:31:00Z"
    }
  }
}`}</code>
          </pre>
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>7. Idempotency</h3>
          <p style={styles.description}>
            Prevent duplicate payment creation on network retries by including
            an Idempotency-Key header.
          </p>
          <pre style={styles.codeBlock}>
            <code>{`// First request - creates payment
curl -X POST http://localhost:8000/api/v1/payments \\
  -H "Idempotency-Key: payment_123_456" \\
  ...

// Retry with same key - returns cached response
curl -X POST http://localhost:8000/api/v1/payments \\
  -H "Idempotency-Key: payment_123_456" \\
  ...`}</code>
          </pre>
          <p style={styles.note}>
            <strong>Note:</strong> Idempotency keys expire after 24 hours.
          </p>
        </section>
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
    maxWidth: "1000px",
    margin: "0 auto",
  },
  section: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
  },
  subTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    marginTop: "20px",
    marginBottom: "10px",
    color: "#555",
  },
  description: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "15px",
    lineHeight: "1.6",
  },
  codeBlock: {
    backgroundColor: "#f8f9fa",
    padding: "15px",
    borderRadius: "4px",
    border: "1px solid #e9ecef",
    overflow: "auto",
    fontSize: "13px",
    fontFamily: "monospace",
    lineHeight: "1.5",
  },
  note: {
    marginTop: "15px",
    padding: "10px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: "4px",
    fontSize: "13px",
    color: "#856404",
  },
  eventList: {
    marginTop: "15px",
    marginBottom: "15px",
  },
  eventItem: {
    padding: "8px 0",
    fontSize: "14px",
    color: "#333",
  },
};

export default ApiDocs;
