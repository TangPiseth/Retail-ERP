const service = require('../services/customerService');
const { success, error, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const { data, total } = await service.getAll({ page: +page, limit: +limit, search });
    return paginated(res, data, { page: +page, limit: +limit, total });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const item = await service.getById(+req.params.id);
    if (!item) return error(res, 'Customer not found', 404);
    return success(res, item);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const item = await service.create(req.body);
    return success(res, item, 'Customer created', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const item = await service.update(+req.params.id, req.body);
    return success(res, item, 'Customer updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await service.remove(+req.params.id);
    return success(res, null, 'Customer deleted');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
