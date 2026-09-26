require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./src/config/database');

const seed = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Wipe data (FK-safe order)
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE order_items');
    await conn.query('TRUNCATE TABLE orders');
    await conn.query('TRUNCATE TABLE cart_items');
    await conn.query('TRUNCATE TABLE carts');
    await conn.query('TRUNCATE TABLE products');
    await conn.query('TRUNCATE TABLE categories');
    await conn.query('TRUNCATE TABLE users');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // Users
    const adminPass = await bcrypt.hash('admin123', 10);
    const userPass = await bcrypt.hash('jane123', 10);

    await conn.query(
      `INSERT INTO users (name, email, password, role) VALUES ?`,
      [[
        ['Admin', 'admin@shop.com', adminPass, 'admin'],
        ['Jane Doe', 'jane@example.com', userPass, 'user'],
      ]]
    );

    // Give Jane a cart
    const [[jane]] = await conn.query(
      'SELECT id FROM users WHERE email = ?',
      ['jane@example.com']
    );
    await conn.query('INSERT INTO carts (user_id) VALUES (?)', [jane.id]);

    // Categories
    const [catResult] = await conn.query(
      'INSERT INTO categories (name, description) VALUES ?',
      [[
        ['Electronics', 'Gadgets and devices'],
        ['Clothing', 'Apparel & accessories'],
        ['Books', 'Fiction & non-fiction'],
      ]]
    );

    // Fetch inserted categories to know IDs
    const [cats] = await conn.query('SELECT id, name FROM categories');
    const catMap = Object.fromEntries(cats.map((c) => [c.name, c.id]));

    // Products
    await conn.query(
      `INSERT INTO products (name, description, price, stock, category_id) VALUES ?`,
      [[
        ['Wireless Headphones', 'Noise-cancelling bluetooth headphones', 199.99, 25, catMap.Electronics],
        ['Smartphone Stand', 'Adjustable aluminium stand', 24.50, 100, catMap.Electronics],
        ['Cotton T-Shirt', 'Comfortable 100% cotton tee', 19.99, 60, catMap.Clothing],
        ['Node.js in Action', 'Practical guide to Node.js', 39.99, 15, catMap.Books],
      ]]
    );

    await conn.commit();
    console.log('✅ Seed complete');
    console.log('Admin: admin@shop.com / admin123');
    console.log('User : jane@example.com / jane123');
    process.exit(0);
  } catch (err) {
    await conn.rollback();
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    conn.release();
  }
};

seed();