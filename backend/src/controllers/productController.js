const service = require('../services/productService');
const { success, error, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, categoryId, brandId, supplierId, stockStatus, sortBy, sortOrder } = req.query;
    const { data, total } = await service.getAll({ page: +page, limit: +limit, search, categoryId, brandId, supplierId, stockStatus, sortBy, sortOrder });
    return paginated(res, data, { page: +page, limit: +limit, total });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const item = await service.getById(+req.params.id);
    if (!item) return error(res, 'Product not found', 404);
    return success(res, item);
  } catch (err) { next(err); }
};

const getByBarcode = async (req, res, next) => {
  try {
    const item = await service.getByBarcode(req.params.barcode);
    if (!item) return error(res, 'Product not found', 404);
    return success(res, item);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const item = await service.create(req.body);
    return success(res, item, 'Product created', 201);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const item = await service.update(+req.params.id, req.body);
    return success(res, item, 'Product updated');
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await service.remove(+req.params.id);
    return success(res, null, 'Product deleted');
  } catch (err) { next(err); }
};

module.exports = { getAll, getById, getByBarcode, create, update, remove };
