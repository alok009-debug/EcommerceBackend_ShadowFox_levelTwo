const express = require('express');
const router = express.Router();
const {
  placeOrder, getMyOrders, getOrder, cancelOrder,
  getAllOrders, updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');

const addressRules = [
  body('shippingAddress.street').notEmpty().withMessage('Street required'),
  body('shippingAddress.city').notEmpty().withMessage('City required'),
  body('shippingAddress.state').notEmpty().withMessage('State required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip required'),
  body('shippingAddress.country').notEmpty().withMessage('Country required'),
];

router.use(protect);
router.post('/', addressRules, validate, placeOrder);
router.get('/', getMyOrders);
router.get('/admin/all', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), updateOrderStatus);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

module.exports = router;