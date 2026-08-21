const expenseService = require('../services/expenseService');
const { success, error, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, categoryId, startDate, endDate } = req.query;
    const { data, total } = await expenseService.getAll({ page: +page, limit: +limit, categoryId, startDate, endDate });
    return paginated(res, data, { page: +page, limit: +limit, total });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const item = await expenseService.getById(+req.params.id);
    if (!item) return error(res, 'Expense not found', 404);
    return success(res, item);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const item = await expenseService.create(req.body, req.user.id);
    return success(res, item, 'Expense created', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const item = await expenseService.update(+req.params.id, req.body);
    return success(res, item, 'Expense updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await expenseService.remove(+req.params.id);
    return success(res, null, 'Expense deleted');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, create, update, remove };
