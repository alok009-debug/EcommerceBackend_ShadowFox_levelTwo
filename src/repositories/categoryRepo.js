const { pool } = require('../config/database');

const create = async ({ name, description = '' }) => {
  const [result] = await pool.query(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description]
  );
  return { id: result.insertId, name, description };
};

const findAll = async () => {
  const [rows] = await pool.query(
    'SELECT id, name, description FROM categories ORDER BY name ASC'
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, name, description FROM categories WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

module.exports = { create, findAll, findById };