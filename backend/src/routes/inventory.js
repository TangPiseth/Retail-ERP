const router = require('express').Router();
const ctrl = require('../controllers/inventoryController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/movements', ctrl.getMovements);
router.get('/low-stock', ctrl.getLowStock);
router.get('/out-of-stock', ctrl.getOutOfStock);
router.post('/adjust', authorize('Admin', 'Manager', 'Inventory Staff'), ctrl.adjust);

module.exports = router;
