const prisma = require('../config/database');

const create = async (data) => {
  return prisma.unit.create({ data });
};

const getAll = async ({ page = 1, limit = 50, search = '' } = {}) => {
  const where = {};
  if (search) where.name = { contains: search };

  const [data, total] = await Promise.all([
    prisma.unit.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.unit.count({ where }),
  ]);

  return { data, total };
};

const getById = async (id) => {
  return prisma.unit.findUnique({ where: { id } });
};

const update = async (id, data) => {
  return prisma.unit.update({ where: { id }, data });
};

const remove = async (id) => {
  return prisma.unit.delete({ where: { id } });
};

module.exports = { create, getAll, getById, update, remove };
