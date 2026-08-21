const purchaseService = require('../services/purchaseService');
const { success, error, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, supplierId, startDate, endDate } = req.query;
    const { data, total } = await purchaseService.getAll({ page: +page, limit: +limit, search, status, supplierId, startDate, endDate });
    return paginated(res, data, { page: +page, limit: +limit, total });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const item = await purchaseService.getById(+req.params.id);
    if (!item) return error(res, 'Purchase not found', 404);
    return success(res, item);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const item = await purchaseService.create(req.body, req.user.id);
    return success(res, item, 'Purchase created', 201);
  } catch (err) { next(err); }
};

const receive = async (req, res, next) => {
  try {
    const item = await purchaseService.receive(+req.params.id, req.user.id);
    return success(res, item, 'Purchase received and inventory updated');
  } catch (err) { next(err); }
};

const cancel = async (req, res, next) => {
  try {
    const item = await purchaseService.cancel(+req.params.id);
    return success(res, item, 'Purchase cancelled');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, receive, cancel };
