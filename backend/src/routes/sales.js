const router = require('express').Router();
const ctrl = require('../controllers/saleController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.post('/hold', ctrl.hold);
router.post('/:id/cancel', authorize('Admin', 'Manager'), ctrl.cancel);

module.exports = router;
