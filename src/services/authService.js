const bcrypt = require('bcryptjs');
const userRepo = require('../repositories/userRepo');
const cartRepo = require('../repositories/cartRepo');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');

const registerUser = async ({ name, email, password }) => {
  const existing = await userRepo.findByEmail(email);
  if (existing) throw new ApiError(400, 'Email already registered');

  const hashed = await bcrypt.hash(password, 10);
  const user = await userRepo.create({ name, email, password: hashed });

  // create empty cart for user
  await cartRepo.getOrCreateCart(user.id);

  const token = generateToken(user.id, user.role);
  return { token, user };
};

const loginUser = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new ApiError(401, 'Invalid email or password');

  const token = generateToken(user.id, user.role);
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

module.exports = { registerUser, loginUser };