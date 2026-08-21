const router = require('express').Router();
const ctrl = require('../controllers/settingController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.put('/', authorize('Admin'), ctrl.update);

module.exports = router;
