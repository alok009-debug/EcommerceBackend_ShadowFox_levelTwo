const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order placement and management
 */

const addressRules = [
  body('shippingAddress.street').notEmpty().withMessage('Street required'),
  body('shippingAddress.city').notEmpty().withMessage('City required'),
  body('shippingAddress.state').notEmpty().withMessage('State required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip required'),
  body('shippingAddress.country').notEmpty().withMessage('Country required'),
];

router.use(protect);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Place an order from the current cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shippingAddress]
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 required: [street, city, state, zipCode, country]
 *                 properties:
 *                   street: { type: string, example: 123 Main St }
 *                   city: { type: string, example: Mumbai }
 *                   state: { type: string, example: MH }
 *                   zipCode: { type: string, example: '400001' }
 *                   country: { type: string, example: India }
 *     responses:
 *       201:
 *         description: Order placed
 *       400:
 *         description: Empty cart or insufficient stock
 *   get:
 *     summary: Get current user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's orders
 */
router.post('/', addressRules, validate, placeOrder);
router.get('/', getMyOrders);

/**
 * @swagger
 * /api/orders/admin/all:
 *   get:
 *     summary: Get all orders (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All orders with user info
 *       403:
 *         description: Admin only
 */
router.get('/admin/all', authorize('admin'), getAllOrders);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Admin only
 */
router.put('/:id/status', authorize('admin'), updateOrderStatus);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a single order (owner or admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order details
 *       403:
 *         description: Not your order
 *       404:
 *         description: Not found
 */
router.get('/:id', getOrder);

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order (restores stock)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order cancelled
 *       400:
 *         description: Cannot cancel shipped/delivered order
 *       403:
 *         description: Not your order
 */
router.put('/:id/cancel', cancelOrder);

module.exports = router;