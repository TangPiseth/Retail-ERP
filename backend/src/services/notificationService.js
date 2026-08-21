const prisma = require('../config/database');

const getAll = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
};

const markAsRead = async (id, userId) => {
  return prisma.notification.update({
    where: { id, userId },
    data: { isRead: true },
  });
};

const markAllAsRead = async (userId) => {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

const create = async (data) => {
  return prisma.notification.create({ data });
};

module.exports = { getAll, markAsRead, markAllAsRead, create };
