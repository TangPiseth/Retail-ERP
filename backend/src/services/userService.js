const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

const getAll = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const where = { deletedAt: null };
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        isActive: true, lastLoginAt: true, createdAt: true,
        role: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { data, total };
};

const ALLOWED_FIELDS = ['email', 'firstName', 'lastName', 'phone', 'roleId', 'password'];

const pickAllowed = (data) => {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => ALLOWED_FIELDS.includes(key))
  );
};

const create = async (data) => {
  const sanitized = pickAllowed(data);
  if (sanitized.roleId) sanitized.roleId = parseInt(sanitized.roleId);
  const hashedPassword = await bcrypt.hash(sanitized.password, 10);
  return prisma.user.create({
    data: { ...sanitized, password: hashedPassword },
    select: {
      id: true, email: true, firstName: true, lastName: true, phone: true,
      isActive: true, createdAt: true, role: true,
    },
  });
};

const update = async (id, data) => {
  const sanitized = pickAllowed(data);
  if (sanitized.roleId) sanitized.roleId = parseInt(sanitized.roleId);
  if (sanitized.password) {
    sanitized.password = await bcrypt.hash(sanitized.password, 10);
  }
  return prisma.user.update({
    where: { id },
    data: sanitized,
    select: {
      id: true, email: true, firstName: true, lastName: true, phone: true,
      isActive: true, createdAt: true, role: true,
    },
  });
};

const getRoles = async () => {
  return prisma.role.findMany();
};

module.exports = { getAll, create, update, getRoles };
