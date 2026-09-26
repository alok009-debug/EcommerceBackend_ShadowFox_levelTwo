const cartRepo = require('../repositories/cartRepo');
const productRepo = require('../repositories/productRepo');
const ApiError = require('../utils/ApiError');

const getCart = async (userId) => cartRepo.getCartWithItems(userId);

const addToCart = async (userId, productId, quantity = 1) => {
  const product = await productRepo.findById(productId);
  if (!product || !product.is_active) throw new ApiError(404, 'Product not available');
  if (product.stock < quantity) throw new ApiError(400, `Only ${product.stock} in stock`);

  const cart = await cartRepo.getOrCreateCart(userId);
  const existing = await cartRepo.findItem(cart.id, productId);

  const newQty = existing ? existing.quantity + quantity : quantity;
  if (newQty > product.stock) throw new ApiError(400, `Only ${product.stock} in stock`);

  await cartRepo.upsertItem(cart.id, productId, newQty, product.price);
  await cartRepo.recalcTotal(cart.id);
  return getCart(userId);
};

const updateCartItem = async (userId, productId, quantity) => {
  if (quantity < 1) throw new ApiError(400, 'Quantity must be at least 1');

  const product = await productRepo.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');
  if (quantity > product.stock) throw new ApiError(400, `Only ${product.stock} in stock`);

  const cart = await cartRepo.getOrCreateCart(userId);
  const item = await cartRepo.findItem(cart.id, productId);
  if (!item) throw new ApiError(404, 'Item not in cart');

  await cartRepo.upsertItem(cart.id, productId, quantity, product.price);
  await cartRepo.recalcTotal(cart.id);
  return getCart(userId);
};

const removeFromCart = async (userId, productId) => {
  const cart = await cartRepo.getOrCreateCart(userId);
  await cartRepo.removeItem(cart.id, productId);
  await cartRepo.recalcTotal(cart.id);
  return getCart(userId);
};

const clearCart = async (userId) => {
  const cart = await cartRepo.getOrCreateCart(userId);
  await cartRepo.clearItems(cart.id);
  await cartRepo.recalcTotal(cart.id);
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};