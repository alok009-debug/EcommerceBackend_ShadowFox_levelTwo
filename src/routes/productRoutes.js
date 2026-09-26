const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  getCategories,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { validate, productRules } = require('../middleware/validation');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product & category management
 */

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: List all categories (public)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of categories
 *   post:
 *     summary: Create a category (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: Electronics }
 *               description: { type: string, example: Gadgets and devices }
 *     responses:
 *       201:
 *         description: Category created
 *       403:
 *         description: Admin only
 */
router.route('/categories')
  .get(getCategories)
  .post(protect, authorize('admin'), createCategory);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: List all products (public, with filters)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string, example: headphones }
 *       - in: query
 *         name: categoryId
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: List of products with pagination
 *   post:
 *     summary: Create a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, stock, categoryId]
 *             properties:
 *               name: { type: string, example: Bluetooth Speaker }
 *               description: { type: string, example: Portable speaker }
 *               price: { type: number, example: 59.99 }
 *               stock: { type: integer, example: 40 }
 *               categoryId: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin only
 */
router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), productRules, validate, createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a product (admin only)
 *     tags: [Products]
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
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               categoryId: { type: integer }
 *     responses:
 *       200:
 *         description: Product updated
 *       403:
 *         description: Admin only
 *   delete:
 *     summary: Soft-delete a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Product removed
 *       403:
 *         description: Admin only
 */
router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;