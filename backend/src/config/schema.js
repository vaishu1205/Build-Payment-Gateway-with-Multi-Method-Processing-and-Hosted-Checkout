const pool = require("./database");

const createTables = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS merchants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        api_key VARCHAR(64) NOT NULL UNIQUE,
        api_secret VARCHAR(64) NOT NULL,
        webhook_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) NOT NULL REFERENCES orders(id),
        merchant_id UUID NOT NULL REFERENCES merchants(id),
        amount INTEGER NOT NULL,
        currency VARCHAR(3) DEFAULT 'INR',
        method VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'processing',
        vpa VARCHAR(255),
        card_network VARCHAR(20),
        card_last4 VARCHAR(4),
        error_code VARCHAR(50),
        error_description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)
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
        INSERT INTO merchants (id, name, email, api_key, api_secret, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
        [
          "550e8400-e29b-41d4-a716-446655440000",
          "Test Merchant",
          process.env.TEST_MERCHANT_EMAIL,
          process.env.TEST_API_KEY,
          process.env.TEST_API_SECRET,
        ]
      );
      console.log("Test merchant seeded successfully");
    } else {
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
