const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({
    success: false,
    errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};

const registerRules = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name min 2 chars'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

const productRules = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('description').trim().notEmpty().withMessage('Description required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be >= 0'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be >= 0'),
  body('categoryId').isInt({ min: 1 }).withMessage('Valid categoryId required'),
];

const cartRules = [
  body('productId').isInt({ min: 1 }).withMessage('Valid productId required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity min 1'),
];

module.exports = { validate, registerRules, loginRules, productRules, cartRules };