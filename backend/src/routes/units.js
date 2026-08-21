const router = require('express').Router();
const ctrl = require('../controllers/unitController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('Admin', 'Manager'), ctrl.create);
router.put('/:id', authorize('Admin', 'Manager'), ctrl.update);
router.delete('/:id', authorize('Admin', 'Manager'), ctrl.remove);

module.exports = router;
