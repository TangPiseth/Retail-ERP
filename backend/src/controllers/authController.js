const authService = require('../services/authService');
const { success, error } = require('../utils/response');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return success(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    return success(res, user, 'User registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getMe, register };
