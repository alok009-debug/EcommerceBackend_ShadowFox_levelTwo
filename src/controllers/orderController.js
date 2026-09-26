const asyncHandler = require('../middleware/asyncHandler');
const orderService = require('../services/orderService');

const placeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.placeOrder(req.user.id, req.body.shippingAddress);
  res.status(201).json({ success: true, data: order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.id);
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(Number(req.params.id), req.user);
  res.status(200).json({ success: true, data: order });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(Number(req.params.id), req.user);
  res.status(200).json({ success: true, data: order });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getAllOrders();
  res.status(200).json({ success: true, count: orders.length, data: orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(
    Number(req.params.id),
    req.body.status
  );
  res.status(200).json({ success: true, data: order });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
}