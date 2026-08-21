const userService = require('../services/userService');
const { success, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const { data, total } = await userService.getAll({ page: +page, limit: +limit, search });
    return paginated(res, data, { page: +page, limit: +limit, total });
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    return success(res, user, 'User created', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const user = await userService.update(+req.params.id, req.body);
    return success(res, user, 'User updated');
  } catch (err) { next(err); }
};

const getRoles = async (req, res, next) => {
  try {
    const roles = await userService.getRoles();
    return success(res, roles);
  } catch (err) { next(err); }
};

module.exports = { getAll, create, update, getRoles };
