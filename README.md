# Payment Gateway Project

This is my payment gateway project built for the internship task. It's similar to Razorpay/Stripe where merchants can accept payments.

## What I Built

- Backend API that handles orders and payments
- Dashboard where merchants can login and see their transactions
- Checkout page where customers can pay using UPI or Card
- Everything runs in Docker containers

## How to Run

Make sure you have Docker installed first.

1. Open terminal and go to the project folder:

```bash
cd payment-gateway
```

2. Start everything:

```bash
docker-compose up -d --build
```

3. Wait a couple minutes for everything to start up

4. Open these in your browser:

- Dashboard: http://localhost:3000
- Checkout: http://localhost:3001
- API: http://localhost:8000

## Testing It Out

### Login to Dashboard

- Go to http://localhost:3000
- Email: test@example.com
- Password: anything works
- You'll see your API keys and transaction stats

### Create an Order

You can use this curl command or the test-order.html file I created:

```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "X-Api-Key: key_test_abc123" \
  -H "X-Api-Secret: secret_test_xyz789" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "currency": "INR"}'
```

This creates an order for ₹500 (amount is in paise).

### Test the Checkout

1. After creating an order, copy the order_id from the response
2. Go to: http://localhost:3001/checkout?order_id=YOUR_ORDER_ID
3. Choose UPI or Card
4. For UPI: enter something like test@paytm
5. For Card: use 4111111111111111, 12/25, 123, Test User
6. Click Pay and wait 5-10 seconds
7. You'll see if payment succeeded or failed

### Check Your Transactions

- Go back to dashboard
- Click "View Transactions"
- You'll see all the payments you just made

## What's Inside

**Backend (Node.js + Express):**

- Handles all the API requests
- Validates payments (checks if card is valid, UPI format is correct)
- Stores everything in PostgreSQL database

**Frontend Dashboard (React):**

- Login page
- Shows your API credentials
- Displays stats (total transactions, amount, success rate)
- Lists all transactions

**Checkout Page (React):**

- Shows order details
- Payment forms for UPI and Card
- Processing animation
- Success/failure screens

**Database (PostgreSQL):**

- Stores merchants, orders, and payments
- Auto-creates a test merchant when you start up

## Tech Stack

- Node.js + Express for backend
- React for frontend
- PostgreSQL for database
- Docker for running everything

## Important Notes

- Payments are simulated (not real)
- UPI payments succeed 90% of the time randomly
- Card payments succeed 95% of the time randomly
- Processing takes 5-10 seconds to simulate bank delay
- Card numbers are validated using Luhn algorithm
- Never stores full card numbers or CVV (only last 4 digits)

## If Something Goes Wrong

Check if all containers are running:

```bash
docker-compose ps
```

See the logs:

```bash
docker-compose logs
```

Stop everything:

```bash
docker-compose down
```

Start fresh:

```bash
docker-compose down -v
docker-compose up -d --build
```

## Test Credentials

**Merchant Login:**

- Email: test@example.com
- Password: anything

**API Access:**

- API Key: key_test_abc123
- API Secret: secret_test_xyz789

**Test Card:**

- Card Number: 4111111111111111
- Expiry: 12/25
- CVV: 123
- Name: Test User

**Test UPI:**

- VPA: test@paytm (or any format like user@bank)

## API Endpoints

Health check: `GET /health`

Orders:

- Create: `POST /api/v1/orders`
- Get: `GET /api/v1/orders/:id`

Payments:

- Create: `POST /api/v1/payments`
- Get: `GET /api/v1/payments/:id`
- Stats: `GET /api/v1/payments/stats`
- List: `GET /api/v1/payments/list`

All need API key/secret in headers except the public endpoints.

## Project Structure

```
payment-gateway/
├── backend/           # API server
├── frontend/          # Merchant dashboard
├── checkout-page/     # Payment checkout
├── docker-compose.yml # Runs everything
└── test-order.html    # Easy way to create orders
```

That's it! Everything should work if you follow the steps above
