const prisma = require('../config/database');

const getInventoryList = async ({ page = 1, limit = 20, search = '', stockStatus = '' } = {}) => {
  const where = { product: { deletedAt: null, isActive: true } };

  if (search) {
    where.product.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
      { barcode: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (stockStatus === 'low') {
    where.currentQuantity = { gt: 0 };
  } else if (stockStatus === 'out') {
    where.currentQuantity = 0;
  }

  const [data, total] = await Promise.all([
    prisma.inventory.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        product: {
          include: { category: true, brand: true, unit: true },
        },
      },
      orderBy: { product: { name: 'asc' } },
    }),
    prisma.inventory.count({ where }),
  ]);

  const enriched = data.map((inv) => ({
    ...inv,
    isLow: inv.currentQuantity > 0 && inv.currentQuantity <= (inv.product.minStock || 10),
    isOut: inv.currentQuantity === 0,
  }));

  return { data: enriched, total };
};

const getMovements = async ({ page = 1, limit = 20, productId, movementType, startDate, endDate } = {}) => {
  const where = {};
  if (productId) where.productId = parseInt(productId);
  if (movementType) where.movementType = movementType;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59');
  }

  const [data, total] = await Promise.all([
    prisma.inventoryMovement.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { product: true, user: { select: { firstName: true, lastName: true } } },
    }),
    prisma.inventoryMovement.count({ where }),
  ]);

  return { data, total };
};

const adjustStock = async (productId, newQuantity, reason, userId) => {
  return prisma.$transaction(async (tx) => {
    const inventory = await tx.inventory.findUnique({ where: { productId } });
    if (!inventory) throw Object.assign(new Error('Inventory not found'), { statusCode: 404 });

    const previousStock = inventory.currentQuantity;
    const change = newQuantity - previousStock;

    await tx.inventory.update({
      where: { productId },
      data: {
        currentQuantity: newQuantity,
        totalAdjusted: { increment: Math.abs(change) },
      },
    });

    await tx.inventoryMovement.create({
      data: {
        productId,
        previousStock,
        change,
        newStock: newQuantity,
        movementType: 'adjustment',
        reason,
        userId,
      },
    });

    await tx.stockAdjustment.create({
      data: {
        productId,
        previousStock,
        newStock: newQuantity,
        adjustmentType: change >= 0 ? 'increase' : 'decrease',
        reason,
        userId,
      },
    });

    return { previousStock, newQuantity, change };
  });
};

const receiveStock = async (productId, quantity, userId, referenceId = null, referenceType = null, tx = null) => {
  const client = tx || prisma;
  const operation = async (t) => {
    const inventory = await t.inventory.findUnique({ where: { productId } });
    if (!inventory) throw Object.assign(new Error('Inventory not found'), { statusCode: 404 });

    const previousStock = inventory.currentQuantity;
    const newStock = previousStock + quantity;

    await t.inventory.update({
      where: { productId },
      data: {
        currentQuantity: newStock,
        totalReceived: { increment: quantity },
      },
    });

    await t.inventoryMovement.create({
      data: {
        productId,
        previousStock,
        change: quantity,
        newStock,
        movementType: 'purchase',
        referenceId,
        referenceType: referenceType || 'purchase',
        reason: 'Stock received from purchase',
        userId,
      },
    });

    return { previousStock, newStock, change: quantity };
  };

  if (tx) return operation(tx);
  return prisma.$transaction(operation);
};

const deductStock = async (productId, quantity, userId, referenceId = null, referenceType = null, tx = null) => {
  const client = tx || prisma;
  const operation = async (t) => {
    const inventory = await t.inventory.findUnique({ where: { productId } });
    if (!inventory) throw Object.assign(new Error('Inventory not found'), { statusCode: 404 });

    const previousStock = inventory.currentQuantity;
    if (previousStock < quantity) {
      throw Object.assign(new Error(`Insufficient stock. Available: ${previousStock}, Requested: ${quantity}`), { statusCode: 400 });
    }

    const newStock = previousStock - quantity;

    await t.inventory.update({
      where: { productId },
      data: {
        currentQuantity: newStock,
        totalSold: { increment: quantity },
      },
    });

    await t.inventoryMovement.create({
      data: {
        productId,
        previousStock,
        change: -quantity,
        newStock,
        movementType: 'sale',
        referenceId,
        referenceType: referenceType || 'sale',
        reason: 'Stock deducted from sale',
        userId,
      },
    });

    return { previousStock, newStock, change: -quantity };
  };

  if (tx) return operation(tx);
  return prisma.$transaction(operation);
};

const getLowStockProducts = async () => {
  const products = await prisma.product.findMany({
    where: { deletedAt: null, isActive: true },
    include: { inventory: true, category: true },
  });

  return products.filter((p) => {
    const qty = p.inventory?.currentQuantity || 0;
    return qty > 0 && qty <= (p.minStock || 10);
  });
};

const getOutOfStockProducts = async () => {
  return prisma.product.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      inventory: { currentQuantity: 0 },
    },
    include: { inventory: true, category: true },
  });
};

module.exports = {
  getInventoryList,
  getMovements,
  adjustStock,
  receiveStock,
  deductStock,
  getLowStockProducts,
  getOutOfStockProducts,
};
