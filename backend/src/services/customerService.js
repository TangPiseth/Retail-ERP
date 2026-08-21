const prisma = require('../config/database');

const ALLOWED_FIELDS = ['name', 'phone', 'email', 'address'];

const pickAllowed = (data) => {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => ALLOWED_FIELDS.includes(key))
  );
};

const create = async (data) => {
  return prisma.customer.create({ data: pickAllowed(data) });
};

const getAll = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const where = { deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
      include: { _count: { select: { sales: true } } },
    }),
    prisma.customer.count({ where }),
  ]);

  return { data, total };
};

const getById = async (id) => {
  return prisma.customer.findFirst({
    where: { id, deletedAt: null },
    include: {
      sales: { take: 20, orderBy: { createdAt: 'desc' }, include: { items: true } },
      _count: { select: { sales: true } },
    },
  });
};

const update = async (id, data) => {
  return prisma.customer.update({ where: { id }, data: pickAllowed(data) });
};

const remove = async (id) => {
  return prisma.customer.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
};

module.exports = { create, getAll, getById, update, remove };
