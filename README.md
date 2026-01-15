# Payment Gateway - Full Stack Project

A complete payment gateway system similar to Razorpay/Stripe that allows merchants to accept online payments through UPI and Cards.

## 📹 Video Demo

**Watch the complete demo:** [YouTube Link](https://youtu.be/hCDhO9ikbro)

## 🎯 What I Built

This project implements a professional payment gateway with two deliverables:

### Deliverable 1: Core Payment System
- Create orders and process payments (UPI and Cards)
- Validate payment methods (Luhn algorithm for cards, VPA format for UPI)
- Merchant dashboard to view transactions
- Hosted checkout page for customers
- Real-time payment status tracking

### Deliverable 2: Advanced Features
- **Async Processing:** Payments processed in background using Redis job queues
- **Webhooks:** Automatic notifications to merchants when payments complete
- **Webhook Retries:** Failed webhooks retry 5 times with exponential backoff
- **Refunds:** Full and partial refund support
- **Idempotency:** Prevents duplicate charges on network retries
- **JavaScript SDK:** Merchants can integrate payments on their website with a modal
- **Security:** HMAC-SHA256 signatures to verify webhooks

## 🛠️ Technology Stack

**Backend:**
- Node.js + Express.js
- PostgreSQL database
- Redis for job queue
- Bull for background workers

**Frontend:**
- React for dashboard and checkout
- Axios for API calls
- React Router for navigation

**DevOps:**
- Docker + Docker Compose
- All services containerized

## 🚀 How to Run

### Prerequisites
- Docker and Docker Compose installed
- Ports 3000, 3001, 5432, 6379, 8000 available

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/vaishu1205/Build-Payment-Gateway-with-Multi-Method-Processing-and-Hosted-Checkout.git
cd Build-Payment-Gateway-with-Multi-Method-Processing-and-Hosted-Checkout
```

2. **Start all services**
```bash
docker-compose up -d --build
```

3. **Wait 2-3 minutes** for all services to start

4. **Access the application**
   - Dashboard: http://localhost:3000
   - Checkout: http://localhost:3001
   - API: http://localhost:8000

## 🧪 How to Test

### 1. Login to Dashboard
- Go to http://localhost:3000
- Email: `test@example.com`
- Password: `anything`

### 2. Create Payment via Checkout
- Open `test-order.html` in browser
- Click "Create Order"
- Click "Go to Checkout"
- Select UPI or Card
- Complete payment

**Test UPI:** `test@paytm`

**Test Card:**
- Card Number: `4111111111111111`
- Expiry: `12/25`
- CVV: `123`
- Name: `Test User`

### 3. View Transactions
- Go to Dashboard → "View Transactions"
- See all your payments

### 4. Test Webhooks

**Setup webhook server:**
```bash
node webhook-test-server.js
```

**Configure in Dashboard:**
- Go to Dashboard → "Webhook Configuration"
- Webhook URL: `http://host.docker.internal:4000/webhook`
- Click "Save" then "Send Test Webhook"
- Check terminal to see webhook received

### 5. Test SDK Integration
- Open `test-sdk.html` in browser
- Click "Pay ₹500.00 with SDK"
- Complete payment in modal
- See success message

### 6. Test Refunds

**Create a refund via API:**
```bash
curl -X POST http://localhost:8000/api/v1/payments/YOUR_PAYMENT_ID/refunds ^
  -H "X-Api-Key: key_test_abc123" ^
  -H "X-Api-Secret: secret_test_xyz789" ^
  -H "Content-Type: application/json" ^
  -d "{\"amount\": 25000, \"reason\": \"Customer requested refund\"}"
```

## 📊 Project Architecture
```
User Browser
    ↓
Dashboard (React) ← → API Server (Node.js) ← → PostgreSQL
    ↓                       ↓                      ↓
Checkout (React)        Redis Queue          Worker Service
    ↓                       ↓                      ↓
SDK (JavaScript)    Background Jobs        Webhook Delivery
```

## 🔐 Security Features

✅ API key/secret authentication
✅ HMAC-SHA256 webhook signatures
✅ Never stores full card numbers (only last 4 digits)
✅ Never stores CVV
✅ Input validation on all endpoints
✅ Idempotency keys to prevent duplicates

## 📝 Key Features Explained

### Async Processing
Payments don't block the API response. They're queued and processed by background workers.

### Webhooks
When a payment succeeds/fails, your server gets notified automatically. If delivery fails, we retry 5 times.

### Refunds
Merchants can refund payments (full or partial). Example: ₹500 payment can be refunded ₹250 twice.

### Idempotency
If the same payment request is sent twice (network retry), only one payment is created.

### SDK
Merchants add one script tag to their website and can accept payments in a modal popup.

## 📁 Project Structure
```
payment-gateway/
├── backend/              # Express API + Worker
│   ├── src/
│   │   ├── controllers/  # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── models/       # Database models
│   │   ├── workers/      # Background jobs
│   │   └── utils/        # Helpers
│   └── Dockerfile
├── frontend/             # Merchant Dashboard
│   ├── src/
│   │   ├── pages/        # Login, Dashboard, Transactions
│   │   └── components/   # Reusable UI components
│   └── Dockerfile
├── checkout-page/        # Customer Checkout + SDK
│   ├── src/
│   │   ├── pages/        # Checkout, Success, Failure
│   │   └── components/   # Payment forms
│   ├── public/
│   │   └── checkout.js   # SDK file
│   └── Dockerfile
└── docker-compose.yml    # Orchestrates all services
```

## 🎓 What I Learned

- Building microservices with Docker
- Async job processing with Redis queues
- Implementing webhooks with retry logic
- Payment validation (Luhn algorithm)
- Secure API design with authentication
- Creating embeddable JavaScript SDKs
- Full-stack development with React and Node.js

## 📞 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/orders | Create payment order |
| GET | /api/v1/orders/:id | Get order details |
| POST | /api/v1/payments | Create payment |
| GET | /api/v1/payments/:id | Get payment status |
| POST | /api/v1/payments/:id/refunds | Create refund |
| GET | /api/v1/refunds/:id | Get refund details |
| GET | /api/v1/webhooks | List webhook logs |
| POST | /api/v1/webhooks/:id/retry | Retry failed webhook |

Full API documentation available at: http://localhost:3000/dashboard/docs



---

**⭐ If you found this project interesting, please star the repository!**
