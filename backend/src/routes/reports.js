const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/sales', authorize('Admin', 'Manager'), ctrl.salesReport);
router.get('/profit', authorize('Admin', 'Manager'), ctrl.profitReport);
router.get('/purchases', authorize('Admin', 'Manager'), ctrl.purchaseReport);
router.get('/expenses', authorize('Admin', 'Manager'), ctrl.expenseReport);
router.get('/inventory', authorize('Admin', 'Manager', 'Inventory Staff'), ctrl.inventoryReport);

module.exports = router;
