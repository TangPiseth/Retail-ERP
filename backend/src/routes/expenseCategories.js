const router = require('express').Router();
const ctrl = require('../controllers/expenseCategoryController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', authorize('Admin', 'Manager'), ctrl.create);
router.put('/:id', authorize('Admin', 'Manager'), ctrl.update);
router.delete('/:id', authorize('Admin', 'Manager'), ctrl.remove);

module.exports = router;
