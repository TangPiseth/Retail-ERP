const service = require('../services/expenseCategoryService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try { return success(res, await service.getAll()); } catch (err) { next(err); }
};
const create = async (req, res, next) => {
  try { return success(res, await service.create(req.body), 'Category created', 201); } catch (err) { next(err); }
};
const update = async (req, res, next) => {
  try { return success(res, await service.update(+req.params.id, req.body)); } catch (err) { next(err); }
};
const remove = async (req, res, next) => {
  try { await service.remove(+req.params.id); return success(res, null, 'Deleted'); } catch (err) { next(err); }
};

module.exports = { getAll, create, update, remove };
