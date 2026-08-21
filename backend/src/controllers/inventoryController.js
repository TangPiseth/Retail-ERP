const inventoryService = require('../services/inventoryService');
const { success, error, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, stockStatus } = req.query;
    const { data, total } = await inventoryService.getInventoryList({ page: +page, limit: +limit, search, stockStatus });
    return paginated(res, data, { page: +page, limit: +limit, total });
  } catch (err) { next(err); }
};

const getMovements = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, productId, movementType, startDate, endDate } = req.query;
    const { data, total } = await inventoryService.getMovements({ page: +page, limit: +limit, productId, movementType, startDate, endDate });
    return paginated(res, data, { page: +page, limit: +limit, total });
  } catch (err) { next(err); }
};

const adjust = async (req, res, next) => {
  try {
    const { productId, newQuantity, reason } = req.body;
    const result = await inventoryService.adjustStock(parseInt(productId), parseInt(newQuantity), reason, req.user.id);
    return success(res, result, 'Stock adjusted successfully');
  } catch (err) { next(err); }
};

const getLowStock = async (req, res, next) => {
  try {
    const data = await inventoryService.getLowStockProducts();
    return success(res, data);
  } catch (err) { next(err); }
};

const getOutOfStock = async (req, res, next) => {
  try {
    const data = await inventoryService.getOutOfStockProducts();
    return success(res, data);
  } catch (err) { next(err); }
};

module.exports = { getAll, getMovements, adjust, getLowStock, getOutOfStock };
