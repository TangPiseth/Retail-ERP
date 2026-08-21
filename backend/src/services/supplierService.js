const prisma = require('../config/database');

const ALLOWED_FIELDS = ['companyName', 'contactPerson', 'phone', 'email', 'address', 'taxNumber'];

const pickAllowed = (data) => {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => ALLOWED_FIELDS.includes(key))
  );
};

const create = async (data) => {
  return prisma.supplier.create({ data: pickAllowed(data) });
};

const getAll = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const where = { deletedAt: null };
  if (search) {
    where.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.supplier.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { companyName: 'asc' },
      include: {
        _count: { select: { products: true, purchases: true } },
      },
    }),
    prisma.supplier.count({ where }),
  ]);

  return { data, total };
};

const getById = async (id) => {
  return prisma.supplier.findFirst({
    where: { id, deletedAt: null },
    include: {
      products: { where: { deletedAt: null }, take: 10 },
      purchases: { take: 10, orderBy: { createdAt: 'desc' } },
      _count: { select: { products: true, purchases: true } },
    },
  });
};

const update = async (id, data) => {
  return prisma.supplier.update({ where: { id }, data: pickAllowed(data) });
};

const remove = async (id) => {
  return prisma.supplier.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
};

module.exports = { create, getAll, getById, update, remove };
