const router = require('express').Router();
const ctrl = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { userCreateValidator } = require('../validators/commonValidator');

router.use(authenticate);
router.get('/', authorize('Admin'), ctrl.getAll);
router.get('/roles', authorize('Admin'), ctrl.getRoles);
router.post('/', authorize('Admin'), userCreateValidator, validate, ctrl.create);
router.put('/:id', authorize('Admin'), ctrl.update);

module.exports = router;
