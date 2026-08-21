const prisma = require('../config/database');

const getSalesReport = async ({ startDate, endDate, cashierId, customerId, paymentMethod } = {}) => {
  const where = { status: 'Completed' };
  if (startDate || endDate) {
    where.saleDate = {};
    if (startDate) where.saleDate.gte = new Date(startDate);
    if (endDate) where.saleDate.lte = new Date(endDate + 'T23:59:59');
  }
  if (cashierId) where.cashierId = parseInt(cashierId);
  if (customerId) where.customerId = parseInt(customerId);
  if (paymentMethod) where.paymentMethod = paymentMethod;

  const [sales, aggregate] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        customer: true,
        cashier: { select: { firstName: true, lastName: true } },
        items: { include: { product: true } },
      },
      orderBy: { saleDate: 'desc' },
    }),
    prisma.sale.aggregate({
      where,
      _sum: { totalAmount: true, discountAmount: true, taxAmount: true },
      _count: true,
      _avg: { totalAmount: true },
    }),
  ]);

  return {
    sales,
    summary: {
      totalSales: Number(aggregate._sum.totalAmount || 0),
      totalDiscount: Number(aggregate._sum.discountAmount || 0),
      totalTax: Number(aggregate._sum.taxAmount || 0),
      transactionCount: aggregate._count,
      averageTransaction: Number(aggregate._avg.totalAmount || 0),
    },
  };
};

const getProfitReport = async ({ startDate, endDate } = {}) => {
  const where = { sale: { status: 'Completed' } };
  if (startDate || endDate) {
    where.sale = { ...where.sale, saleDate: {} };
    if (startDate) where.sale.saleDate.gte = new Date(startDate);
    if (endDate) where.sale.saleDate.lte = new Date(endDate + 'T23:59:59');
  }

  const [salesData, expensesData] = await Promise.all([
    prisma.saleItem.findMany({
      where,
      include: { sale: true },
    }),
    prisma.expense.aggregate({
      where: startDate || endDate ? {
        expenseDate: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate + 'T23:59:59') }),
        },
      } : {},
      _sum: { amount: true },
    }),
  ]);

  const revenue = salesData.reduce((sum, item) => sum + Number(item.totalPrice), 0);
  const cogs = salesData.reduce((sum, item) => sum + (Number(item.costPrice) * item.quantity), 0);
  const discounts = salesData.reduce((sum, item) => sum + Number(item.discount || 0), 0);
  const expenses = Number(expensesData._sum.amount || 0);

  return {
    revenue,
    cogs,
    grossProfit: revenue - cogs,
    discounts,
    expenses,
    netProfit: revenue - cogs - expenses,
  };
};

const getPurchaseReport = async ({ startDate, endDate, supplierId } = {}) => {
  const where = {};
  if (startDate || endDate) {
    where.purchaseDate = {};
    if (startDate) where.purchaseDate.gte = new Date(startDate);
    if (endDate) where.purchaseDate.lte = new Date(endDate + 'T23:59:59');
  }
  if (supplierId) where.supplierId = parseInt(supplierId);

  const [purchases, aggregate] = await Promise.all([
    prisma.purchase.findMany({
      where,
      include: { supplier: true, items: { include: { product: true } } },
      orderBy: { purchaseDate: 'desc' },
    }),
    prisma.purchase.aggregate({
      where,
      _sum: { totalAmount: true },
      _count: true,
    }),
  ]);

  return {
    purchases,
    summary: {
      totalPurchases: Number(aggregate._sum.totalAmount || 0),
      purchaseCount: aggregate._count,
    },
  };
};

const getExpenseReport = async ({ startDate, endDate } = {}) => {
  const where = {};
  if (startDate || endDate) {
    where.expenseDate = {};
    if (startDate) where.expenseDate.gte = new Date(startDate);
    if (endDate) where.expenseDate.lte = new Date(endDate + 'T23:59:59');
  }

  const [expenses, byCategory] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { expenseDate: 'desc' },
    }),
    prisma.expense.groupBy({
      by: ['categoryId'],
      where,
      _sum: { amount: true },
      _count: true,
    }).then(async (groups) => {
      const catIds = groups.map(g => g.categoryId);
      const categories = await prisma.expenseCategory.findMany({
        where: { id: { in: catIds } },
      });
      return groups.map(g => ({
        category: categories.find(c => c.id === g.categoryId)?.name || 'Unknown',
        total: Number(g._sum.amount || 0),
        count: g._count,
      }));
    }),
  ]);

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return { expenses, byCategory, total };
};

const getInventoryReport = async () => {
  const products = await prisma.product.findMany({
    where: { deletedAt: null, isActive: true },
    include: { inventory: true, category: true },
  });

  const totalValue = products.reduce((sum, p) => {
    return sum + (Number(p.costPrice) * (p.inventory?.currentQuantity || 0));
  }, 0);

  const lowStock = products.filter(p => {
    const qty = p.inventory?.currentQuantity || 0;
    return qty > 0 && qty <= (p.minStock || 10);
  });

  const outOfStock = products.filter(p => (p.inventory?.currentQuantity || 0) === 0);

  return { totalValue, totalProducts: products.length, lowStock, outOfStock };
};

module.exports = { getSalesReport, getProfitReport, getPurchaseReport, getExpenseReport, getInventoryReport };
