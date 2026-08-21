const reportService = require('../services/reportService');
const { success } = require('../utils/response');

const salesReport = async (req, res, next) => {
  try {
    const data = await reportService.getSalesReport(req.query);
    return success(res, data);
  } catch (err) { next(err); }
};

const profitReport = async (req, res, next) => {
  try {
    const data = await reportService.getProfitReport(req.query);
    return success(res, data);
  } catch (err) { next(err); }
};

const purchaseReport = async (req, res, next) => {
  try {
    const data = await reportService.getPurchaseReport(req.query);
    return success(res, data);
  } catch (err) { next(err); }
};

const expenseReport = async (req, res, next) => {
  try {
    const data = await reportService.getExpenseReport(req.query);
    return success(res, data);
  } catch (err) { next(err); }
};

const inventoryReport = async (req, res, next) => {
  try {
    const data = await reportService.getInventoryReport();
    return success(res, data);
  } catch (err) { next(err); }
};

module.exports = { salesReport, profitReport, purchaseReport, expenseReport, inventoryReport };
