const dashboardService = require('../services/dashboardService');
const { success } = require('../utils/response');

const getDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardData();
    return success(res, data);
  } catch (err) { next(err); }
};

module.exports = { getDashboard };
