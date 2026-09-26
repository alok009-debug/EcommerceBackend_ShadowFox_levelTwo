const asyncHandler = require('../middleware/asyncHandler');
const cartService = require('../services/cartService');

exports.getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.status(200).json({ success: true, data: cart });
});

exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await cartService.addToCart(req.user.id, productId, quantity || 1);
  res.status(200).json({ success: true, data: cart });
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateCartItem(
    req.user.id,
    req.params.productId,
    Number(req.body.quantity)
  );
  res.status(200).json({ success: true, data: cart });
});

exports.removeFromCart = asyncHandler(async (req, res) => {
  const cart = await cartService.removeFromCart(req.user.id, req.params.productId);
  res.status(200).json({
    success: true,
    data: cart
  });
});

exports.clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user.id);
  res.status(200).json({
    success: true,
    message: 'Cart cleared'
  });
});