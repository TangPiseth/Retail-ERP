const prisma = require('../config/database');

const create = async (data) => {
  return prisma.brand.create({ data });
};

const getAll = async ({ page = 1, limit = 50, search = '' } = {}) => {
  const where = { deletedAt: null };
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const [data, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    }),
    prisma.brand.count({ where }),
  ]);

  return { data, total };
};

const getById = async (id) => {
  return prisma.brand.findFirst({
    where: { id, deletedAt: null },
    include: { _count: { select: { products: true } } },
  });
};

const update = async (id, data) => {
  return prisma.brand.update({ where: { id }, data });
};

const remove = async (id) => {
  return prisma.brand.update({ where: { id }, data: { deletedAt: new Date() } });
};

module.exports = { create, getAll, getById, update, remove };
