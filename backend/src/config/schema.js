const pool = require("./database");

const createTables = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Merchants table (add webhook_secret column for Deliverable 2)
    await client.query(`
      CREATE TABLE IF NOT EXISTS merchants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        api_key VARCHAR(64) NOT NULL UNIQUE,
        api_secret VARCHAR(64) NOT NULL,
        webhook_url TEXT,
        webhook_secret VARCHAR(64),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add webhook_secret column if it doesn't exist (for existing databases)
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'merchants' AND column_name = 'webhook_secret'
        ) THEN
          ALTER TABLE merchants ADD COLUMN webhook_secret VARCHAR(64);
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        merchant_id UUID NOT NULL REFERENCES merchants(id),
        amount INTEGER NOT NULL CHECK (amount >= 100),
        currency VARCHAR(3) DEFAULT 'INR',
        receipt VARCHAR(255),
        notes JSONB,
        status VARCHAR(20) DEFAULT 'created',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payments table (add captured column for Deliverable 2)
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL REFERENCES orders(id),
        merchant_id UUID NOT NULL REFERENCES merchants(id),
        amount INTEGER NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        method VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        captured BOOLEAN DEFAULT false,
        vpa VARCHAR(255),
        card_network VARCHAR(20),
        card_last4 VARCHAR(4),
        error_code VARCHAR(50),
        error_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add captured column if it doesn't exist (for existing databases)
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'payments' AND column_name = 'captured'
        ) THEN
          ALTER TABLE payments ADD COLUMN captured BOOLEAN DEFAULT false;
        END IF;
      END $$;
    `);

    // NEW: Refunds table
    await client.query(`
      CREATE TABLE IF NOT EXISTS refunds (
        id VARCHAR(64) PRIMARY KEY,
        payment_id VARCHAR(64) NOT NULL REFERENCES payments(id),
        merchant_id UUID NOT NULL REFERENCES merchants(id),
        amount INTEGER NOT NULL,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP
      )
    `);

    // NEW: Webhook Logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS webhook_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        merchant_id UUID NOT NULL REFERENCES merchants(id),
        event VARCHAR(50) NOT NULL,
        payload JSONB NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        attempts INTEGER DEFAULT 0,
        last_attempt_at TIMESTAMP,
        next_retry_at TIMESTAMP,
        response_code INTEGER,
        response_body TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // NEW: Idempotency Keys table
    await client.query(`
      CREATE TABLE IF NOT EXISTS idempotency_keys (
        key VARCHAR(255) NOT NULL,
        merchant_id UUID NOT NULL REFERENCES merchants(id),
        response JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        PRIMARY KEY (key, merchant_id)
      )
    `);

    // Existing indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)
    `);

    // NEW: Indexes for Deliverable 2
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_logs_merchant_id ON webhook_logs(merchant_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_webhook_logs_next_retry 
      ON webhook_logs(next_retry_at) WHERE status = 'pending'
    `);

    await client.query("COMMIT");
    console.log("Database tables created successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating tables:", error);
    throw error;
  } finally {
    client.release();
  }
};

const seedTestMerchant = async () => {
  const client = await pool.connect();

  try {
    const checkMerchant = await client.query(
      "SELECT id FROM merchants WHERE email = $1",
      [process.env.TEST_MERCHANT_EMAIL]
    );

    if (checkMerchant.rows.length === 0) {
      await client.query(
        `
        INSERT INTO merchants (id, name, email, api_key, api_secret, webhook_secret, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
        [
          "550e8400-e29b-41d4-a716-446655440000",
          "Test Merchant",
          process.env.TEST_MERCHANT_EMAIL,
          process.env.TEST_API_KEY,
          process.env.TEST_API_SECRET,
          process.env.TEST_WEBHOOK_SECRET || "whsec_test_abc123",
        ]
      );
      console.log("Test merchant seeded successfully");
    } else {
      // Update existing test merchant with webhook_secret if not set
      await client.query(
        `
        UPDATE merchants 
        SET webhook_secret = $1 
        WHERE email = $2 AND webhook_secret IS NULL
      `,
        [
          process.env.TEST_WEBHOOK_SECRET || "whsec_test_abc123",
          process.env.TEST_MERCHANT_EMAIL,
        ]
      );
      console.log("Test merchant already exists");
    }
  } catch (error) {
    console.error("Error seeding test merchant:", error);
    throw error;
  } finally {
    client.release();
  }
};

const initializeDatabase = async () => {
  await createTables();
  await seedTestMerchant();
};

module.exports = { initializeDatabase };
