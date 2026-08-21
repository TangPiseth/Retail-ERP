const prisma = require('../config/database');
const inventoryService = require('./inventoryService');

const generatePurchaseNumber = async () => {
  const count = await prisma.purchase.count();
  return `PUR-${String(count + 1).padStart(6, '0')}`;
};

const create = async (data, userId) => {
  const purchaseNumber = await generatePurchaseNumber();

  return prisma.$transaction(async (tx) => {
    const subtotal = data.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const discountAmount = data.discountAmount || 0;
    const taxAmount = data.taxAmount || 0;
    const totalAmount = subtotal - discountAmount + taxAmount;

    const purchase = await tx.purchase.create({
      data: {
        purchaseNumber,
        supplierId: data.supplierId,
        invoiceNumber: data.invoiceNumber,
        status: 'Pending',
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        paymentStatus: 'Unpaid',
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            tax: item.tax || 0,
            totalPrice: (item.unitPrice * item.quantity) - (item.discount || 0) + (item.tax || 0),
          })),
        },
      },
      include: { items: { include: { product: true } }, supplier: true },
    });

    return purchase;
  });
};

const getAll = async ({ page = 1, limit = 20, search = '', status, supplierId, startDate, endDate } = {}) => {
  const where = {};
  if (search) {
    where.OR = [
      { purchaseNumber: { contains: search } },
      { invoiceNumber: { contains: search } },
    ];
  }
  if (status) where.status = status;
  if (supplierId) where.supplierId = parseInt(supplierId);
  if (startDate || endDate) {
    where.purchaseDate = {};
    if (startDate) where.purchaseDate.gte = new Date(startDate);
    if (endDate) where.purchaseDate.lte = new Date(endDate + 'T23:59:59');
  }

  const [data, total] = await Promise.all([
    prisma.purchase.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { supplier: true, items: { include: { product: true } }, payments: true },
    }),
    prisma.purchase.count({ where }),
  ]);

  return { data, total };
};

const getById = async (id) => {
  return prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: { include: { product: true } },
      payments: true,
    },
  });
};

const receive = async (purchaseId, userId) => {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.findUnique({
      where: { id: purchaseId },
      include: { items: true },
    });

    if (!purchase) throw Object.assign(new Error('Purchase not found'), { statusCode: 404 });
    if (purchase.status === 'Received') throw Object.assign(new Error('Purchase already received'), { statusCode: 400 });
    if (purchase.status === 'Cancelled') throw Object.assign(new Error('Cannot receive cancelled purchase'), { statusCode: 400 });

    for (const item of purchase.items) {
      await inventoryService.receiveStock(item.productId, item.quantity, userId, purchaseId, 'purchase', tx);
    }

    const updated = await tx.purchase.update({
      where: { id: purchaseId },
      data: { status: 'Received' },
      include: { items: { include: { product: true } }, supplier: true },
    });

    return updated;
  });
};

const cancel = async (purchaseId) => {
  const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
  if (!purchase) throw Object.assign(new Error('Purchase not found'), { statusCode: 404 });
  if (purchase.status === 'Received') throw Object.assign(new Error('Cannot cancel received purchase'), { statusCode: 400 });

  return prisma.purchase.update({
    where: { id: purchaseId },
    data: { status: 'Cancelled' },
  });
};

module.exports = { create, getAll, getById, receive, cancel };
