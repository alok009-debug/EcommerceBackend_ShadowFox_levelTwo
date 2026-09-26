const { pool } = require('../config/database');
const orderRepo = require('../repositories/orderRepo');
const cartRepo = require('../repositories/cartRepo');
const productRepo = require('../repositories/productRepo');
const ApiError = require('../utils/ApiError');

/**
 * Place order — the whole operation runs inside a single SQL transaction.
 * Uses SELECT ... FOR UPDATE to lock rows and prevent race conditions.
 */
const placeOrder = async (userId, shippingAddress) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Get user's cart (lock it)
    const [cartRows] = await conn.query(
      'SELECT id FROM carts WHERE user_id = ? FOR UPDATE',
      [userId]
    );
    if (!cartRows[0]) throw new ApiError(400, 'Cart not found');
    const cartId = cartRows[0].id;

    // 2. Load cart items with product lock
    const items = await cartRepo.getItemsWithProduct(conn, cartId);
    if (!items.length) throw new ApiError(400, 'Cart is empty');

    // 3. Validate all items first
    for (const item of items) {
      if (!item.isActive) {
        throw new ApiError(400, `Product '${item.name}' is not available`);
      }
      if (item.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for '${item.name}'. Available: ${item.stock}`);
      }
    }

    // 4. Compute total
    const totalAmount = items.reduce(
      (sum, i) => sum + Number(i.price) * i.quantity,
      0
    );

    // 5. Create order
    const orderId = await orderRepo.createOrder(conn, {
      userId,
      street: shippingAddress.street,
      city: shippingAddress.city,
      state: shippingAddress.state,
      zipCode: shippingAddress.zipCode,
      country: shippingAddress.country,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // 6. Create order items (snapshot)
    await orderRepo.createOrderItems(
      conn,
      orderId,
      items.map((i) => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      }))
    );

    // 7. Decrement stock
    for (const item of items) {
      await productRepo.decrementStock(conn, item.productId, item.quantity);
    }

    // 8. Clear cart
    await conn.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    await conn.query('UPDATE carts SET total_amount = 0 WHERE id = ?', [cartId]);

    await conn.commit();
    conn.release();

    // Return full order from a fresh connection
    return orderRepo.findById(orderId);
  } catch (err) {
    await conn.rollback();
    conn.release();
    throw err;
  }
};

const getUserOrders = (userId) => orderRepo.findByUser(userId);

const getOrderById = async (orderId, user) => {
  const order = await orderRepo.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');
  if (order.userId !== user.id && user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to view this order');
  }
  return order;
};

/**
 * Cancel order — restore stock inside a transaction.
 */
const cancelOrder = async (orderId, user) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const order = await orderRepo.lockOrderForUpdate(conn, orderId);
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.userId !== user.id && user.role !== 'admin') {
      throw new ApiError(403, 'Not authorized');
    }
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      throw new ApiError(400, `Order cannot be cancelled in '${order.status}' state`);
    }

    const items = await orderRepo.getOrderItems(conn, orderId);
    for (const item of items) {
      await productRepo.incrementStock(conn, item.productId, item.quantity);
    }

    await orderRepo.updateStatusTxn(conn, orderId, 'cancelled');

    await conn.commit();
    conn.release();

    return orderRepo.findById(orderId);
  } catch (err) {
    await conn.rollback();
    conn.release();
    throw err;
  }
};

const getAllOrders = () => orderRepo.findAll();

const updateOrderStatus = async (orderId, status) => {
  const order = await orderRepo.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');
  return orderRepo.updateStatus(orderId, status);
};

module.exports = {
  placeOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
};