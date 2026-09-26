const { pool } = require('../config/database');

const createOrder = async (conn, orderData) => {
  const [result] = await conn.query(
    `INSERT INTO orders
      (user_id, shipping_street, shipping_city, shipping_state, shipping_zip,
       shipping_country, total_amount, status, payment_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      orderData.userId,
      orderData.street,
      orderData.city,
      orderData.state,
      orderData.zipCode,
      orderData.country,
      orderData.totalAmount,
      orderData.status || 'pending',
      orderData.paymentStatus || 'pending',
    ]
  );
  return result.insertId;
};

const createOrderItems = async (conn, orderId, items) => {
  if (!items.length) return;
  const values = items.map((i) => [orderId, i.productId, i.name, i.quantity, i.price]);
  await conn.query(
    'INSERT INTO order_items (order_id, product_id, name, quantity, price) VALUES ?',
    [values]
  );
};

const findById = async (id) => {
  const [orderRows] = await pool.query(
    `SELECT id, user_id AS userId, shipping_street AS street, shipping_city AS city,
            shipping_state AS state, shipping_zip AS zipCode, shipping_country AS country,
            total_amount AS totalAmount, status, payment_status AS paymentStatus,
            created_at, updated_at
     FROM orders WHERE id = ? LIMIT 1`,
    [id]
  );

  const order = orderRows[0];
  if (!order) return null;

  const [items] = await pool.query(
    `SELECT oi.id, oi.product_id AS productId, oi.name, oi.quantity, oi.price,
            p.images
     FROM order_items oi
     LEFT JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = ?`,
    [id]
  );
  order.items = items;
  return order;
};

const findByUser = async (userId) => {
  const [orders] = await pool.query(
    `SELECT id, user_id AS userId, total_amount AS totalAmount, status,
            payment_status AS paymentStatus, created_at, updated_at
     FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );

  if (!orders.length) return [];

  const ids = orders.map((o) => o.id);
  const [items] = await pool.query(
    `SELECT order_id AS orderId, product_id AS productId, name, quantity, price
     FROM order_items WHERE order_id IN (?)`,
    [ids]
  );

  const itemsByOrder = items.reduce((acc, i) => {
    (acc[i.orderId] ||= []).push(i);
    return acc;
  }, {});

  return orders.map((o) => ({ ...o, items: itemsByOrder[o.id] || [] }));
};

const findAll = async () => {
  const [orders] = await pool.query(
    `SELECT o.id, o.user_id AS userId, u.name AS userName, u.email AS userEmail,
            o.total_amount AS totalAmount, o.status, o.payment_status AS paymentStatus,
            o.created_at, o.updated_at
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC`
  );
  return orders;
};

const updateStatus = async (id, status) => {
  await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
  return findById(id);
};

const lockOrderForUpdate = async (conn, orderId) => {
  const [rows] = await conn.query(
    'SELECT id, user_id AS userId, status FROM orders WHERE id = ? FOR UPDATE',
    [orderId]
  );
  return rows[0] || null;
};

const getOrderItems = async (conn, orderId) => {
  const [rows] = await conn.query(
    'SELECT product_id AS productId, quantity FROM order_items WHERE order_id = ?',
    [orderId]
  );
  return rows;
};

const updateStatusTxn = async (conn, orderId, status) => {
  await conn.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
};

module.exports = {
  createOrder,
  createOrderItems,
  findById,
  findByUser,
  findAll,
  updateStatus,
  lockOrderForUpdate,
  getOrderItems,
  updateStatusTxn,
};