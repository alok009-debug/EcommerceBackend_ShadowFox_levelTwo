const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const { validate, cartRules } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart operations (auth required)
 */

router.use(protect);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart with items and total
 *       401:
 *         description: Not authorized
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: integer, example: 1 }
 *               quantity: { type: integer, example: 2, default: 1 }
 *     responses:
 *       200:
 *         description: Updated cart
 *       400:
 *         description: Insufficient stock or validation error
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.get('/', getCart);
router.post('/', cartRules, validate, addToCart);
router.delete('/', clearCart);

/**
 * @swagger
 * /api/cart/{productId}:
 *   put:
 *     summary: Update quantity of a cart item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, example: 3 }
 *     responses:
 *       200:
 *         description: Cart updated
 *       400:
 *         description: Insufficient stock
 *       404:
 *         description: Item not in cart
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Item removed
 */
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeFromCart);

module.exports = router;