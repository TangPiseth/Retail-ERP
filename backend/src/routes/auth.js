const router = require('express').Router();
const { login, getMe, register } = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { loginValidator, registerValidator } = require('../validators/authValidator');

router.post('/login', loginValidator, validate, login);
router.get('/me', authenticate, getMe);
router.post('/register', authenticate, authorize('Admin'), registerValidator, validate, register);

module.exports = router;
