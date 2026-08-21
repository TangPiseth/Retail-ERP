const router = require('express').Router();
const ctrl = require('../controllers/supplierController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { supplierCreateValidator } = require('../validators/commonValidator');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('Admin', 'Manager'), supplierCreateValidator, validate, ctrl.create);
router.put('/:id', authorize('Admin', 'Manager'), ctrl.update);
router.delete('/:id', authorize('Admin', 'Manager'), ctrl.remove);

module.exports = router;
