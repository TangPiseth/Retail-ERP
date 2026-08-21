const notificationService = require('../services/notificationService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const data = await notificationService.getAll(req.user.id);
    return success(res, data);
  } catch (err) { next(err); }
};

const markAsRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(+req.params.id, req.user.id);
    return success(res, null, 'Marked as read');
  } catch (err) { next(err); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return success(res, null, 'All marked as read');
  } catch (err) { next(err); }
};

module.exports = { getAll, markAsRead, markAllAsRead };
