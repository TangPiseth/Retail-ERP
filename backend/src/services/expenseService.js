const prisma = require('../config/database');

const ALLOWED_FIELDS = ['categoryId', 'description', 'amount', 'paymentMethod', 'expenseDate', 'notes'];

const pickAllowed = (data) => {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => ALLOWED_FIELDS.includes(key))
  );
};

const create = async (data, userId) => {
  const sanitized = pickAllowed(data);
  return prisma.expense.create({
    data: { ...sanitized, createdBy: userId },
    include: { category: true, creator: { select: { firstName: true, lastName: true } } },
  });
};

const getAll = async ({ page = 1, limit = 20, categoryId, startDate, endDate } = {}) => {
  const where = {};
  if (categoryId) where.categoryId = parseInt(categoryId);
  if (startDate || endDate) {
    where.expenseDate = {};
    if (startDate) where.expenseDate.gte = new Date(startDate);
    if (endDate) where.expenseDate.lte = new Date(endDate + 'T23:59:59');
  }

  const [data, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { category: true, creator: { select: { firstName: true, lastName: true } } },
    }),
    prisma.expense.count({ where }),
  ]);

  return { data, total };
};

const getById = async (id) => {
  return prisma.expense.findUnique({
    where: { id },
    include: { category: true, creator: { select: { firstName: true, lastName: true } } },
  });
};

const update = async (id, data) => {
  const sanitized = pickAllowed(data);
  return prisma.expense.update({ where: { id }, data: sanitized, include: { category: true } });
};

const remove = async (id) => {
  return prisma.expense.delete({ where: { id } });
};

module.exports = { create, getAll, getById, update, remove };
