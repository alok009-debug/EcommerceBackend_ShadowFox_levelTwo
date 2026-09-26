const productRepo = require('../repositories/productRepo');
const categoryRepo = require('../repositories/categoryRepo');
const ApiError = require('../utils/ApiError');

const createProduct = async (data) => {
  const category = await categoryRepo.findById(data.categoryId);
  if (!category) throw new ApiError(404, 'Category not found');
  return productRepo.create(data);
};

const getProducts = async (query) => productRepo.findAll(query);

const getProductById = async (id) => {
  const product = await productRepo.findById(id);
  if (!product) throw new ApiError(404, 'Product not found');
  return product;
};

const updateProduct = async (id, data) => {
  const product = await productRepo.findById(id);
  if (!product) throw new ApiError(404, 'Product not found');
  if (data.categoryId) {
    const cat = await categoryRepo.findById(data.categoryId);
    if (!cat) throw new ApiError(404, 'Category not found');
  }
  return productRepo.update(id, data);
};

const deleteProduct = async (id) => {
  const product = await productRepo.findById(id);
  if (!product) throw new ApiError(404, 'Product not found');
  await productRepo.softDelete(id);
};

const createCategory = async (data) => categoryRepo.create(data);
const getCategories = async () => categoryRepo.findAll();

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createCategory,
  getCategories,
};