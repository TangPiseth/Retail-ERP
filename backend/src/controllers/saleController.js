const saleService = require('../services/saleService');
const { success, error, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, cashierId, customerId, startDate, endDate } = req.query;
    const { data, total } = await saleService.getAll({ page: +page, limit: +limit, search, status, cashierId, customerId, startDate, endDate });
    return paginated(res, data, { page: +page, limit: +limit, total });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const item = await saleService.getById(+req.params.id);
    if (!item) return error(res, 'Sale not found', 404);
    return success(res, item);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const item = await saleService.create(req.body, req.user.id);
    return success(res, item, 'Sale completed', 201);
  } catch (err) { next(err); }
};

const hold = async (req, res, next) => {
  try {
    const item = await saleService.hold(req.body, req.user.id);
    return success(res, item, 'Sale held', 201);
  } catch (err) { next(err); }
};

const cancel = async (req, res, next) => {
  try {
    const item = await saleService.cancel(+req.params.id, req.user.id);
    return success(res, item, 'Sale cancelled');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, hold, cancel };
