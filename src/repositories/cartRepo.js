const { pool } = require('../config/database');

const getOrCreateCart = async (userId) => {
  const [rows] = await pool.query(
    'SELECT id, user_id, total_amount FROM carts WHERE user_id = ? LIMIT 1',
    [userId]
  );
  if (rows[0]) return rows[0];

  const [result] = await pool.query(
    'INSERT INTO carts (user_id, total_amount) VALUES (?, 0)',
    [userId]
  );
  return { id: result.insertId, user_id: userId, total_amount: 0 };
};

const getCartWithItems = async (userId) => {
  const cart = await getOrCreateCart(userId);

  const [items] = await pool.query(
    `SELECT ci.id, ci.product_id AS productId, ci.quantity, ci.price,
            p.name, p.stock, p.images, p.is_active AS isActive
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = ?`,
    [cart.id]
  );

  return {
    id: cart.id,
    userId: cart.user_id,
    totalAmount: cart.total_amount,
    items: items.map((i) => ({
      productId: i.productId,
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      stock: i.stock,
      isActive: !!i.isActive,
      images: i.images,
    })),
  };
};

const findItem = async (cartId, productId) => {
  const [rows] = await pool.query(
    'SELECT id, quantity, price FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1',
    [cartId, productId]
  );
  return rows[0] || null;
};

const upsertItem = async (cartId, productId, quantity, price) => {
  await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity, price)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), price = VALUES(price)`,
    [cartId, productId, quantity, price]
  );
};

const removeItem = async (cartId, productId) => {
  await pool.query(
    'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
    [cartId, productId]
  );
};

const clearItems = async (cartId) => {
  await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
};

const recalcTotal = async (cartId) => {
  await pool.query(
    `UPDATE carts
     SET total_amount = (
       SELECT COALESCE(SUM(price * quantity), 0) FROM cart_items WHERE cart_id = ?
     )
     WHERE id = ?`,
    [cartId, cartId]
  );
};

const getItemsWithProduct = async (conn, cartId) => {
  const [rows] = await conn.query(
    `SELECT ci.product_id AS productId, ci.quantity, ci.price,
            p.name, p.stock, p.is_active AS isActive
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     WHERE ci.cart_id = ?
     FOR UPDATE`,
    [cartId]
  );
  return rows;
};

module.exports = {
  getOrCreateCart, getCartWithItems, findItem,
  upsertItem, removeItem, clearItems, recalcTotal,
  getItemsWithProduct,
};