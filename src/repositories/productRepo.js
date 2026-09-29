const { pool } = require('../config/database');

const create = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO products (name, description, price, stock, category_id, images)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.description,
      data.price,
      data.stock,
      data.categoryId,
      JSON.stringify(data.images || []),   // ← this line
    ]
  );
  return findById(result.insertId);
};

const findById = async (id) => {
  const [rows] = await pool.query(
    `SELECT p.id, p.name, p.description, p.price, p.stock, p.images, p.is_active,
            p.category_id AS categoryId,
            c.name AS categoryName,
            p.created_at, p.updated_at
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

const findAll = async ({ page = 1, limit = 10, search, categoryId }) => {
  const offset = (Number(page) - 1) * Number(limit);
  const params = [];
  const conditions = ['p.is_active = 1'];

  if (search) {
    conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (categoryId) {
    conditions.push('p.category_id = ?');
    params.push(categoryId);
  }

  const whereClause = 'WHERE ' + conditions.join(' AND ');

  // Count
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM products p ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  // Data
  const [rows] = await pool.query(
    `SELECT p.id, p.name, p.description, p.price, p.stock, p.images, p.is_active,
            p.category_id AS categoryId,
            c.name AS categoryName,
            p.created_at, p.updated_at
     FROM products p
     JOIN categories c ON c.id = p.category_id
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );

  return {
    products: rows,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  };
};

const update = async (id, data) => {
  const fields = [];
  const params = [];

  const allowed = ['name', 'description', 'price', 'stock', 'category_id', 'images', 'is_active'];
  const mapping = {
    name: 'name',
    description: 'description',
    price: 'price',
    stock: 'stock',
    categoryId: 'category_id',
    images: 'images',
    isActive: 'is_active',
  };

  for (const key of Object.keys(data)) {
    const col = mapping[key];
    if (!col) continue;
    fields.push(`${col} = ?`);
    params.push(key === 'images' ? JSON.stringify(data[key]) : data[key]);
  }

  if (!fields.length) return findById(id);

  params.push(id);
  await pool.query(
    `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
    params
  );
  return findById(id);
};

const softDelete = async (id) => {
  await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
};

// For stock updates in transactions
const getStockForUpdate = async (conn, productId) => {
  const [rows] = await conn.query(
    'SELECT id, name, stock, is_active FROM products WHERE id = ? FOR UPDATE',
    [productId]
  );
  return rows[0] || null;
};

const decrementStock = async (conn, productId, qty) => {
  await conn.query(
    'UPDATE products SET stock = stock - ? WHERE id = ?',
    [qty, productId]
  );
};

const incrementStock = async (conn, productId, qty) => {
  await conn.query(
    'UPDATE products SET stock = stock + ? WHERE id = ?',
    [qty, productId]
  );
};

module.exports = {
  create,
  findById,
  findAll,
  update,
  softDelete,
  getStockForUpdate,
  decrementStock,
  incrementStock,
};