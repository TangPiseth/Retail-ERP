const settingService = require('../services/settingService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const data = await settingService.getAll();
    return success(res, data);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const data = await settingService.update(req.body);
    return success(res, data, 'Settings updated');
  } catch (err) { next(err); }
};

module.exports = { getAll, update };
