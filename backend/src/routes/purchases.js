const router = require('express').Router();
const ctrl = require('../controllers/purchaseController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('Admin', 'Manager', 'Inventory Staff'), ctrl.create);
router.post('/:id/receive', authorize('Admin', 'Manager', 'Inventory Staff'), ctrl.receive);
router.post('/:id/cancel', authorize('Admin', 'Manager'), ctrl.cancel);

module.exports = router;
