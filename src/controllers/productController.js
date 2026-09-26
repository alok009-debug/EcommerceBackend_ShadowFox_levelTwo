const asyncHandler = require('../middleware/asyncHandler');
const productService = require('../services/productService');

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, data: product });
});

exports.getProducts = asyncHandler(async (req, res) => {
  const data = await productService.getProducts(req.query);
  res.status(200).json({ success: true, ...data });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ success: true, data: product });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json({ success: true, data: product });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.status(200).json({ success: true, message: 'Product removed' });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await productService.createCategory(req.body);
  res.status(201).json({ success: true, data: category });
});

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await productService.getCategories();
  res.status(200).json({ success: true, data: categories });
});