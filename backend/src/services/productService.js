const prisma = require('../config/database');

const ALLOWED_FIELDS = ['name', 'sku', 'barcode', 'description', 'categoryId', 'brandId', 'unitId', 'supplierId', 'costPrice', 'sellingPrice', 'taxRate', 'minStock', 'maxStock', 'isActive'];

const pickAllowed = (data) => {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => ALLOWED_FIELDS.includes(key))
  );
};

const create = async (data) => {
  const sanitized = pickAllowed(data);
  const product = await prisma.product.create({
    data: {
      ...sanitized,
      inventory: { create: { currentQuantity: 0 } },
    },
    include: { category: true, brand: true, unit: true, supplier: true, inventory: true },
  });
  return product;
};

const getAll = async ({ page = 1, limit = 20, search = '', categoryId, brandId, supplierId, stockStatus, sortBy = 'name', sortOrder = 'asc' } = {}) => {
  const where = { deletedAt: null, isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { barcode: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (categoryId) where.categoryId = parseInt(categoryId);
  if (brandId) where.brandId = parseInt(brandId);
  if (supplierId) where.supplierId = parseInt(supplierId);

  if (stockStatus === 'low') {
    where.inventory = { currentQuantity: { gt: 0, lte: 10 } };
  } else if (stockStatus === 'out') {
    where.inventory = { currentQuantity: 0 };
  }

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: true,
        brand: true,
        unit: true,
        supplier: true,
        inventory: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { data, total };
};

const getById = async (id) => {
  return prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      category: true,
      brand: true,
      unit: true,
      supplier: true,
      inventory: true,
    },
  });
};

const getByBarcode = async (barcode) => {
  return prisma.product.findFirst({
    where: { barcode, deletedAt: null, isActive: true },
    include: {
      category: true,
      brand: true,
      unit: true,
      supplier: true,
      inventory: true,
    },
  });
};

const update = async (id, data) => {
  const sanitized = pickAllowed(data);
  return prisma.product.update({
    where: { id },
    data: sanitized,
    include: { category: true, brand: true, unit: true, supplier: true, inventory: true },
  });
};

const remove = async (id) => {
  return prisma.product.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
};

module.exports = { create, getAll, getById, getByBarcode, update, remove };
