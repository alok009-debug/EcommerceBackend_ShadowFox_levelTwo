const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/authService');

exports.register = asyncHandler(async (req, res) => {
  const data = await authService.registerUser(req.body);
  res.status(201).json({ success: true, ...data });
});

exports.login = asyncHandler(async (req, res) => {
  const data = await authService.loginUser(req.body);
  res.status(200).json({ success: true, ...data });
});

exports.getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});