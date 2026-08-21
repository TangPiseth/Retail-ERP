const prisma = require('../config/database');
const inventoryService = require('./inventoryService');

const generateSaleNumber = async () => {
  const count = await prisma.sale.count();
  return `SALE-${String(count + 1).padStart(6, '0')}`;
};

const create = async (data, userId) => {
  const saleNumber = await generateSaleNumber();

  return prisma.$transaction(async (tx) => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const discountAmount = data.discountAmount || 0;
    const taxAmount = data.items.reduce((sum, item) => {
      return sum + (item.unitPrice * item.quantity * (item.taxRate || 0) / 100);
    }, 0);
    const totalAmount = subtotal - discountAmount + taxAmount;

    const sale = await tx.sale.create({
      data: {
        saleNumber,
        customerId: data.customerId || null,
        cashierId: userId,
        status: 'Completed',
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        paymentMethod: data.paymentMethod || 'Cash',
        paymentStatus: 'Paid',
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            costPrice: item.costPrice || 0,
            discount: item.discount || 0,
            tax: item.tax || 0,
            totalPrice: (item.unitPrice * item.quantity) - (item.discount || 0) + (item.tax || 0),
          })),
        },
      },
      include: { items: true },
    });

    // Create payment
    await tx.payment.create({
      data: {
        paymentNumber: `PAY-${saleNumber}`,
        saleId: sale.id,
        amount: totalAmount,
        paymentMethod: data.paymentMethod || 'Cash',
      },
    });

    // Deduct inventory for each item
    for (const item of data.items) {
      await inventoryService.deductStock(item.productId, item.quantity, userId, sale.id, 'sale', tx);
    }

    // Update customer loyalty points and total spent
    if (data.customerId) {
      const loyaltyRate = 1; // $1 = 1 point
      const points = Math.floor(totalAmount * loyaltyRate);
      await tx.customer.update({
        where: { id: data.customerId },
        data: {
          loyaltyPoints: { increment: points },
          totalSpent: { increment: totalAmount },
        },
      });
    }

    const fullSale = await tx.sale.findUnique({
      where: { id: sale.id },
      include: {
        items: { include: { product: true } },
        customer: true,
        cashier: { select: { firstName: true, lastName: true } },
        payments: true,
      },
    });

    return fullSale;
  });
};

const hold = async (data, userId) => {
  const saleNumber = await generateSaleNumber();

  return prisma.sale.create({
    data: {
      saleNumber,
      customerId: data.customerId || null,
      cashierId: userId,
      status: 'Held',
      subtotal: 0,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      paymentMethod: data.paymentMethod || 'Cash',
      paymentStatus: 'Pending',
      notes: JSON.stringify({ items: data.items, discount: data.discount }),
    },
  });
};

const getAll = async ({ page = 1, limit = 20, search = '', status, cashierId, customerId, startDate, endDate } = {}) => {
  const where = {};
  if (search) {
    where.OR = [
      { saleNumber: { contains: search } },
    ];
  }
  if (status) where.status = status;
  if (cashierId) where.cashierId = parseInt(cashierId);
  if (customerId) where.customerId = parseInt(customerId);
  if (startDate || endDate) {
    where.saleDate = {};
    if (startDate) where.saleDate.gte = new Date(startDate);
    if (endDate) where.saleDate.lte = new Date(endDate + 'T23:59:59');
  }

  const [data, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        cashier: { select: { firstName: true, lastName: true } },
        items: { include: { product: true } },
        payments: true,
      },
    }),
    prisma.sale.count({ where }),
  ]);

  return { data, total };
};

const getById = async (id) => {
  return prisma.sale.findUnique({
    where: { id },
    include: {
      customer: true,
      cashier: { select: { firstName: true, lastName: true, email: true } },
      items: { include: { product: true } },
      payments: true,
      returns: { include: { items: { include: { product: true } } } },
    },
  });
};

const cancel = async (saleId, userId) => {
  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id: saleId },
      include: { items: true },
    });

    if (!sale) throw Object.assign(new Error('Sale not found'), { statusCode: 404 });
    if (sale.status === 'Cancelled') throw Object.assign(new Error('Sale already cancelled'), { statusCode: 400 });

    // Reverse inventory
    for (const item of sale.items) {
      const inventory = await tx.inventory.findUnique({ where: { productId: item.productId } });
      if (inventory) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { currentQuantity: { increment: item.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            previousStock: inventory.currentQuantity,
            change: item.quantity,
            newStock: inventory.currentQuantity + item.quantity,
            movementType: 'return',
            referenceId: saleId,
            referenceType: 'sale_cancel',
            reason: 'Sale cancelled',
            userId,
          },
        });
      }
    }

    return tx.sale.update({
      where: { id: saleId },
      data: { status: 'Cancelled', paymentStatus: 'Refunded' },
    });
  });
};

module.exports = { create, hold, getAll, getById, cancel };
