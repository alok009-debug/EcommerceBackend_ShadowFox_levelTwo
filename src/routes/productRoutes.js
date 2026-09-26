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

router.route('/categories')
  .get(getCategories)
  .post(protect, authorize('admin'), createCategory);

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin'), productRules, validate, createProduct);

router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
