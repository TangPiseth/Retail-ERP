const prisma = require('../config/database');

const getDashboardData = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    todaySales,
    todayTransactions,
    totalProducts,
    lowStockCount,
    outOfStockCount,
    pendingPurchases,
    totalCustomers,
    totalSuppliers,
    recentSales,
    topProducts,
    salesByCategory,
  ] = await Promise.all([
    prisma.sale.aggregate({
      where: { saleDate: { gte: today, lt: tomorrow }, status: 'Completed' },
      _sum: { totalAmount: true },
    }),
    prisma.sale.count({
      where: { saleDate: { gte: today, lt: tomorrow }, status: 'Completed' },
    }),
    prisma.product.count({ where: { deletedAt: null, isActive: true } }),
    prisma.inventory.count({
      where: {
        product: { deletedAt: null, isActive: true },
        currentQuantity: { gt: 0 },
      },
    }).then(async (count) => {
      const products = await prisma.product.findMany({
        where: { deletedAt: null, isActive: true },
        include: { inventory: true },
      });
      return products.filter(p => {
        const qty = p.inventory?.currentQuantity || 0;
        return qty > 0 && qty <= (p.minStock || 10);
      }).length;
    }),
    prisma.inventory.count({
      where: { currentQuantity: 0, product: { deletedAt: null, isActive: true } },
    }),
    prisma.purchase.count({ where: { status: 'Pending' } }),
    prisma.customer.count({ where: { deletedAt: null } }),
    prisma.supplier.count({ where: { deletedAt: null } }),
    prisma.sale.findMany({
      where: { status: 'Completed' },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        cashier: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.saleItem.groupBy({
      by: ['productId'],
      where: { sale: { status: 'Completed' } },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    }).then(async (items) => {
      const productIds = items.map(i => i.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, sku: true },
      });
      return items.map(item => ({
        ...item,
        product: products.find(p => p.id === item.productId),
      }));
    }),
    prisma.saleItem.groupBy({
      by: ['productId'],
      where: { sale: { status: 'Completed' } },
      _sum: { totalPrice: true },
    }).then(async (items) => {
      const productIds = items.map(i => i.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { category: true },
      });
      const categoryMap = {};
      items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product?.category) {
          const catName = product.category.name;
          categoryMap[catName] = (categoryMap[catName] || 0) + Number(item._sum.totalPrice || 0);
        }
      });
      return Object.entries(categoryMap).map(([name, total]) => ({ name, total }));
    }),
  ]);

  // Sales chart data (last 7 days)
  const salesChart = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const daySales = await prisma.sale.aggregate({
      where: { saleDate: { gte: date, lt: nextDate }, status: 'Completed' },
      _sum: { totalAmount: true },
      _count: true,
    });

    salesChart.push({
      date: date.toISOString().split('T')[0],
      total: Number(daySales._sum.totalAmount || 0),
      count: daySales._count,
    });
  }

  return {
    todaySales: Number(todaySales._sum.totalAmount || 0),
    todayTransactions,
    totalProducts,
    lowStockCount,
    outOfStockCount,
    pendingPurchases,
    totalCustomers,
    totalSuppliers,
    recentSales,
    topProducts,
    salesByCategory,
    salesChart,
  };
};

module.exports = { getDashboardData };
