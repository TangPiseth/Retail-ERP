require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', description: 'Full system access' },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'Manager' },
    update: {},
    create: { name: 'Manager', description: 'Manage products, inventory, sales, and reports' },
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: 'Cashier' },
    update: {},
    create: { name: 'Cashier', description: 'Process sales and manage customers' },
  });

  const inventoryRole = await prisma.role.upsert({
    where: { name: 'Inventory Staff' },
    update: {},
    create: { name: 'Inventory Staff', description: 'Manage inventory and suppliers' },
  });

  // Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const managerPassword = await bcrypt.hash('manager123', 10);
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const inventoryPassword = await bcrypt.hash('inventory123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '555-0100',
      roleId: adminRole.id,
      isActive: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: managerPassword,
      firstName: 'Manager',
      lastName: 'User',
      phone: '555-0101',
      roleId: managerRole.id,
      isActive: true,
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@example.com' },
    update: {},
    create: {
      email: 'cashier@example.com',
      password: cashierPassword,
      firstName: 'Cashier',
      lastName: 'User',
      phone: '555-0102',
      roleId: cashierRole.id,
      isActive: true,
    },
  });

  const inventoryUser = await prisma.user.upsert({
    where: { email: 'inventory@example.com' },
    update: {},
    create: {
      email: 'inventory@example.com',
      password: inventoryPassword,
      firstName: 'Inventory',
      lastName: 'User',
      phone: '555-0103',
      roleId: inventoryRole.id,
      isActive: true,
    },
  });

  // Units
  const units = await Promise.all([
    prisma.unit.upsert({ where: { name: 'Piece' }, update: {}, create: { name: 'Piece', shortName: 'pc' } }),
    prisma.unit.upsert({ where: { name: 'Kilogram' }, update: {}, create: { name: 'Kilogram', shortName: 'kg' } }),
    prisma.unit.upsert({ where: { name: 'Liter' }, update: {}, create: { name: 'Liter', shortName: 'L' } }),
    prisma.unit.upsert({ where: { name: 'Pack' }, update: {}, create: { name: 'Pack', shortName: 'pk' } }),
    prisma.unit.upsert({ where: { name: 'Box' }, update: {}, create: { name: 'Box', shortName: 'bx' } }),
    prisma.unit.upsert({ where: { name: 'Bottle' }, update: {}, create: { name: 'Bottle', shortName: 'bt' } }),
    prisma.unit.upsert({ where: { name: 'Can' }, update: {}, create: { name: 'Can', shortName: 'cn' } }),
    prisma.unit.upsert({ where: { name: 'Bag' }, update: {}, create: { name: 'Bag', shortName: 'bg' } }),
  ]);

  // Categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'Beverages' }, update: {}, create: { name: 'Beverages', description: 'Drinks and beverages' } }),
    prisma.category.upsert({ where: { name: 'Snacks' }, update: {}, create: { name: 'Snacks', description: 'Chips, cookies, and snack foods' } }),
    prisma.category.upsert({ where: { name: 'Rice & Grains' }, update: {}, create: { name: 'Rice & Grains', description: 'Rice, pasta, and grains' } }),
    prisma.category.upsert({ where: { name: 'Cooking Oil' }, update: {}, create: { name: 'Cooking Oil', description: 'Cooking oils and fats' } }),
    prisma.category.upsert({ where: { name: 'Instant Noodles' }, update: {}, create: { name: 'Instant Noodles', description: 'Instant noodles and cup noodles' } }),
    prisma.category.upsert({ where: { name: 'Cleaning Products' }, update: {}, create: { name: 'Cleaning Products', description: 'Household cleaning supplies' } }),
    prisma.category.upsert({ where: { name: 'Personal Care' }, update: {}, create: { name: 'Personal Care', description: 'Shampoo, soap, toothpaste' } }),
    prisma.category.upsert({ where: { name: 'Household' }, update: {}, create: { name: 'Household', description: 'Household essentials' } }),
    prisma.category.upsert({ where: { name: 'Dairy' }, update: {}, create: { name: 'Dairy', description: 'Milk, cheese, yogurt' } }),
    prisma.category.upsert({ where: { name: 'Canned Food' }, update: {}, create: { name: 'Canned Food', description: 'Canned goods' } }),
    prisma.category.upsert({ where: { name: 'Bread & Bakery' }, update: {}, create: { name: 'Bread & Bakery', description: 'Bread, pastries, and baked goods' } }),
    prisma.category.upsert({ where: { name: 'Frozen Foods' }, update: {}, create: { name: 'Frozen Foods', description: 'Frozen meals and vegetables' } }),
  ]);

  // Brands
  const brands = await Promise.all([
    prisma.brand.upsert({ where: { name: 'Coca-Cola' }, update: {}, create: { name: 'Coca-Cola', description: 'The Coca-Cola Company' } }),
    prisma.brand.upsert({ where: { name: 'Pepsi' }, update: {}, create: { name: 'Pepsi', description: 'PepsiCo' } }),
    prisma.brand.upsert({ where: { name: 'Lay\'s' }, update: {}, create: { name: 'Lay\'s', description: 'Frito-Lay' } }),
    prisma.brand.upsert({ where: { name: 'Nissin' }, update: {}, create: { name: 'Nissin', description: 'Nissin Foods' } }),
    prisma.brand.upsert({ where: { name: 'Indomie' }, update: {}, create: { name: 'Indomie', description: 'Indofood' } }),
    prisma.brand.upsert({ where: { name: 'Tide' }, update: {}, create: { name: 'Tide', description: 'Procter & Gamble' } }),
    prisma.brand.upsert({ where: { name: 'Dove' }, update: {}, create: { name: 'Dove', description: 'Unilever' } }),
    prisma.brand.upsert({ where: { name: 'Bango' }, update: {}, create: { name: 'Bango', description: 'Unilever Indonesia' } }),
    prisma.brand.upsert({ where: { name: 'Cap Beras' }, update: {}, create: { name: 'Cap Beras', description: 'Local rice brand' } }),
    prisma.brand.upsert({ where: { name: 'Tropicana' }, update: {}, create: { name: 'Tropicana', description: 'Tropicana Slim' } }),
    prisma.brand.upsert({ where: { name: 'Anchor' }, update: {}, create: { name: 'Anchor', description: 'Anchor Dairy' } }),
    prisma.brand.upsert({ where: { name: 'Del Monte' }, update: {}, create: { name: 'Del Monte', description: 'Del Monte Foods' } }),
  ]);

  // Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.upsert({
      where: { companyName: 'Global Beverages Inc.' },
      update: {},
      create: { companyName: 'Global Beverages Inc.', contactPerson: 'John Smith', phone: '555-1001', email: 'john@globalbev.com', address: '123 Beverage St', taxNumber: 'TAX-001' },
    }),
    prisma.supplier.upsert({
      where: { companyName: 'Fresh Foods Distribution' },
      update: {},
      create: { companyName: 'Fresh Foods Distribution', contactPerson: 'Sarah Lee', phone: '555-1002', email: 'sarah@freshfoods.com', address: '456 Food Ave', taxNumber: 'TAX-002' },
    }),
    prisma.supplier.upsert({
      where: { companyName: 'HomeCare Supplies Co.' },
      update: {},
      create: { companyName: 'HomeCare Supplies Co.', contactPerson: 'Mike Chen', phone: '555-1003', email: 'mike@homecare.com', address: '789 Clean Blvd', taxNumber: 'TAX-003' },
    }),
    prisma.supplier.upsert({
      where: { companyName: 'Asia Pacific Foods' },
      update: {},
      create: { companyName: 'Asia Pacific Foods', contactPerson: 'Lisa Wong', phone: '555-1004', email: 'lisa@apfoods.com', address: '321 Asia Rd', taxNumber: 'TAX-004' },
    }),
    prisma.supplier.upsert({
      where: { companyName: 'Daily Dairy Ltd.' },
      update: {},
      create: { companyName: 'Daily Dairy Ltd.', contactPerson: 'Tom Brown', phone: '555-1005', email: 'tom@dailydairy.com', address: '654 Dairy Lane', taxNumber: 'TAX-005' },
    }),
  ]);

  // Customers
  const customerData = [
    { name: 'Alice Johnson', phone: '555-2001', email: 'alice@email.com', address: '100 Main St' },
    { name: 'Bob Williams', phone: '555-2002', email: 'bob@email.com', address: '200 Oak Ave' },
    { name: 'Carol Davis', phone: '555-2003', email: 'carol@email.com', address: '300 Pine Rd' },
    { name: 'David Wilson', phone: '555-2004', email: 'david@email.com', address: '400 Elm St' },
    { name: 'Eva Martinez', phone: '555-2005', email: 'eva@email.com', address: '500 Maple Dr' },
    { name: 'Frank Garcia', phone: '555-2006', email: 'frank@email.com', address: '600 Cedar Ln' },
    { name: 'Grace Kim', phone: '555-2007', email: 'grace@email.com', address: '700 Birch Ct' },
    { name: 'Henry Patel', phone: '555-2008', email: 'henry@email.com', address: '800 Walnut Way' },
    { name: 'Iris Chen', phone: '555-2009', email: 'iris@email.com', address: '900 Spruce Pl' },
    { name: 'Jack Thompson', phone: '555-2010', email: 'jack@email.com', address: '1000 Ash Blvd' },
    { name: 'Karen White', phone: '555-2011', email: 'karen@email.com', address: '1100 Cherry St' },
    { name: 'Leo Anderson', phone: '555-2012', email: 'leo@email.com', address: '1200 Poplar Ave' },
    { name: 'Mia Robinson', phone: '555-2013', email: 'mia@email.com', address: '1300 Willow Rd' },
    { name: 'Noah Clark', phone: '555-2014', email: 'noah@email.com', address: '1400 Hickory Dr' },
    { name: 'Olivia Lewis', phone: '555-2015', email: 'olivia@email.com', address: '1500 Magnolia Ln' },
    { name: 'Paul Walker', phone: '555-2016', email: 'paul@email.com', address: '1600 Sycamore Ct' },
    { name: 'Quinn Hall', phone: '555-2017', email: 'quinn@email.com', address: '1700 Chestnut Way' },
    { name: 'Rachel Young', phone: '555-2018', email: 'rachel@email.com', address: '1800 Cypress Pl' },
    { name: 'Sam King', phone: '555-2019', email: 'sam@email.com', address: '1900 Redwood Blvd' },
    { name: 'Tina Scott', phone: '555-2020', email: 'tina@email.com', address: '2000 Sequoia St' },
  ];

  for (const c of customerData) {
    await prisma.customer.create({ data: c });
  }

  // Products
  const products = [
    { sku: 'BEV-001', barcode: '4902102113153', name: 'Coca-Cola 500ml', categoryId: categories[0].id, brandId: brands[0].id, unitId: units[5].id, supplierId: suppliers[0].id, costPrice: 0.50, sellingPrice: 1.00, taxRate: 10, minStock: 50, maxStock: 500 },
    { sku: 'BEV-002', barcode: '4902102113160', name: 'Coca-Cola 1.5L', categoryId: categories[0].id, brandId: brands[0].id, unitId: units[5].id, supplierId: suppliers[0].id, costPrice: 0.80, sellingPrice: 1.50, taxRate: 10, minStock: 30, maxStock: 300 },
    { sku: 'BEV-003', barcode: '4902102113177', name: 'Pepsi 500ml', categoryId: categories[0].id, brandId: brands[1].id, unitId: units[5].id, supplierId: suppliers[0].id, costPrice: 0.45, sellingPrice: 1.00, taxRate: 10, minStock: 50, maxStock: 500 },
    { sku: 'BEV-004', barcode: '4902102113184', name: 'Pepsi 1.5L', categoryId: categories[0].id, brandId: brands[1].id, unitId: units[5].id, supplierId: suppliers[0].id, costPrice: 0.75, sellingPrice: 1.50, taxRate: 10, minStock: 30, maxStock: 300 },
    { sku: 'BEV-005', barcode: '4902102113191', name: 'Sprite 500ml', categoryId: categories[0].id, brandId: brands[0].id, unitId: units[5].id, supplierId: suppliers[0].id, costPrice: 0.50, sellingPrice: 1.00, taxRate: 10, minStock: 40, maxStock: 400 },
    { sku: 'SNK-001', barcode: '4902102113207', name: 'Lay\'s Classic 50g', categoryId: categories[1].id, brandId: brands[2].id, unitId: units[0].id, supplierId: suppliers[1].id, costPrice: 0.30, sellingPrice: 0.75, taxRate: 10, minStock: 60, maxStock: 600 },
    { sku: 'SNK-002', barcode: '4902102113214', name: 'Lay\'s BBQ 50g', categoryId: categories[1].id, brandId: brands[2].id, unitId: units[0].id, supplierId: suppliers[1].id, costPrice: 0.30, sellingPrice: 0.75, taxRate: 10, minStock: 60, maxStock: 600 },
    { sku: 'SNK-003', barcode: '4902102113221', name: 'Oreo Cookies 137g', categoryId: categories[1].id, brandId: null, unitId: units[3].id, supplierId: suppliers[1].id, costPrice: 0.80, sellingPrice: 1.50, taxRate: 10, minStock: 40, maxStock: 400 },
    { sku: 'RIC-001', barcode: '4902102113238', name: 'Premium Rice 5kg', categoryId: categories[2].id, brandId: brands[8].id, unitId: units[7].id, supplierId: suppliers[3].id, costPrice: 4.00, sellingPrice: 6.50, taxRate: 0, minStock: 20, maxStock: 200 },
    { sku: 'RIC-002', barcode: '4902102113245', name: 'Jasmine Rice 5kg', categoryId: categories[2].id, brandId: brands[8].id, unitId: units[7].id, supplierId: suppliers[3].id, costPrice: 5.00, sellingPrice: 8.00, taxRate: 0, minStock: 15, maxStock: 150 },
    { sku: 'OIL-001', barcode: '4902102113252', name: 'Cooking Oil 2L', categoryId: categories[3].id, brandId: brands[9].id, unitId: units[2].id, supplierId: suppliers[3].id, costPrice: 2.00, sellingPrice: 3.50, taxRate: 5, minStock: 25, maxStock: 250 },
    { sku: 'OIL-002', barcode: '4902102113269', name: 'Olive Oil 500ml', categoryId: categories[3].id, brandId: null, unitId: units[5].id, supplierId: suppliers[3].id, costPrice: 4.00, sellingPrice: 7.00, taxRate: 5, minStock: 15, maxStock: 150 },
    { sku: 'NDL-001', barcode: '4902102113276', name: 'Nissin Cup Noodles', categoryId: categories[4].id, brandId: brands[3].id, unitId: units[0].id, supplierId: suppliers[3].id, costPrice: 0.40, sellingPrice: 0.85, taxRate: 10, minStock: 80, maxStock: 800 },
    { sku: 'NDL-002', barcode: '4902102113283', name: 'Indomie Mi Goreng', categoryId: categories[4].id, brandId: brands[4].id, unitId: units[3].id, supplierId: suppliers[3].id, costPrice: 0.25, sellingPrice: 0.50, taxRate: 10, minStock: 100, maxStock: 1000 },
    { sku: 'NDL-003', barcode: '4902102113290', name: 'Indomie Curry 5-Pack', categoryId: categories[4].id, brandId: brands[4].id, unitId: units[3].id, supplierId: suppliers[3].id, costPrice: 1.00, sellingPrice: 2.00, taxRate: 10, minStock: 50, maxStock: 500 },
    { sku: 'CLN-001', barcode: '4902102113306', name: 'Tide Detergent 1kg', categoryId: categories[5].id, brandId: brands[5].id, unitId: units[3].id, supplierId: suppliers[2].id, costPrice: 2.50, sellingPrice: 4.50, taxRate: 10, minStock: 20, maxStock: 200 },
    { sku: 'CLN-002', barcode: '4902102113313', name: 'Dish Soap 500ml', categoryId: categories[5].id, brandId: null, unitId: units[5].id, supplierId: suppliers[2].id, costPrice: 0.80, sellingPrice: 1.50, taxRate: 10, minStock: 30, maxStock: 300 },
    { sku: 'CLN-003', barcode: '4902102113320', name: 'Floor Cleaner 1L', categoryId: categories[5].id, brandId: null, unitId: units[2].id, supplierId: suppliers[2].id, costPrice: 1.20, sellingPrice: 2.25, taxRate: 10, minStock: 20, maxStock: 200 },
    { sku: 'PER-001', barcode: '4902102113337', name: 'Dove Shampoo 400ml', categoryId: categories[6].id, brandId: brands[6].id, unitId: units[5].id, supplierId: suppliers[2].id, costPrice: 2.00, sellingPrice: 3.75, taxRate: 10, minStock: 25, maxStock: 250 },
    { sku: 'PER-002', barcode: '4902102113344', name: 'Dove Body Wash 500ml', categoryId: categories[6].id, brandId: brands[6].id, unitId: units[5].id, supplierId: suppliers[2].id, costPrice: 2.20, sellingPrice: 4.00, taxRate: 10, minStock: 20, maxStock: 200 },
    { sku: 'PER-003', barcode: '4902102113351', name: 'Toothpaste 100ml', categoryId: categories[6].id, brandId: null, unitId: units[0].id, supplierId: suppliers[2].id, costPrice: 0.80, sellingPrice: 1.50, taxRate: 10, minStock: 40, maxStock: 400 },
    { sku: 'HH-001', barcode: '4902102113368', name: 'Paper Towels 6-Pack', categoryId: categories[7].id, brandId: null, unitId: units[3].id, supplierId: suppliers[2].id, costPrice: 1.50, sellingPrice: 2.75, taxRate: 10, minStock: 30, maxStock: 300 },
    { sku: 'HH-002', barcode: '4902102113375', name: 'Trash Bags 30-Pack', categoryId: categories[7].id, brandId: null, unitId: units[3].id, supplierId: suppliers[2].id, costPrice: 1.00, sellingPrice: 2.00, taxRate: 10, minStock: 25, maxStock: 250 },
    { sku: 'DAI-001', barcode: '4902102113382', name: 'Fresh Milk 1L', categoryId: categories[8].id, brandId: brands[10].id, unitId: units[2].id, supplierId: suppliers[4].id, costPrice: 0.80, sellingPrice: 1.50, taxRate: 0, minStock: 40, maxStock: 400 },
    { sku: 'DAI-002', barcode: '4902102113399', name: 'Cheddar Cheese 200g', categoryId: categories[8].id, brandId: brands[10].id, unitId: units[0].id, supplierId: suppliers[4].id, costPrice: 1.50, sellingPrice: 2.75, taxRate: 0, minStock: 20, maxStock: 200 },
    { sku: 'DAI-003', barcode: '4902102113405', name: 'Greek Yogurt 500g', categoryId: categories[8].id, brandId: null, unitId: units[0].id, supplierId: suppliers[4].id, costPrice: 1.20, sellingPrice: 2.25, taxRate: 0, minStock: 25, maxStock: 250 },
    { sku: 'CAN-001', barcode: '4902102113412', name: 'Canned Tuna 185g', categoryId: categories[9].id, brandId: brands[11].id, unitId: units[6].id, supplierId: suppliers[3].id, costPrice: 0.60, sellingPrice: 1.25, taxRate: 5, minStock: 50, maxStock: 500 },
    { sku: 'CAN-002', barcode: '4902102113429', name: 'Canned Corn 340g', categoryId: categories[9].id, brandId: brands[11].id, unitId: units[6].id, supplierId: suppliers[3].id, costPrice: 0.40, sellingPrice: 0.90, taxRate: 5, minStock: 40, maxStock: 400 },
    { sku: 'CAN-003', barcode: '4902102113436', name: 'Canned Beans 400g', categoryId: categories[9].id, brandId: brands[11].id, unitId: units[6].id, supplierId: suppliers[3].id, costPrice: 0.45, sellingPrice: 0.95, taxRate: 5, minStock: 40, maxStock: 400 },
    { sku: 'SAU-001', barcode: '4902102113443', name: 'Bango Sweet Soy 600ml', categoryId: categories[3].id, brandId: brands[7].id, unitId: units[5].id, supplierId: suppliers[3].id, costPrice: 1.50, sellingPrice: 2.75, taxRate: 5, minStock: 20, maxStock: 200 },
    { sku: 'SAU-002', barcode: '4902102113450', name: 'Chili Sauce 500ml', categoryId: categories[3].id, brandId: null, unitId: units[5].id, supplierId: suppliers[3].id, costPrice: 0.80, sellingPrice: 1.50, taxRate: 5, minStock: 25, maxStock: 250 },
    { sku: 'BEV-006', barcode: '4902102113467', name: 'Mineral Water 600ml', categoryId: categories[0].id, brandId: null, unitId: units[5].id, supplierId: suppliers[0].id, costPrice: 0.15, sellingPrice: 0.50, taxRate: 0, minStock: 100, maxStock: 1000 },
    { sku: 'BEV-007', barcode: '4902102113474', name: 'Orange Juice 1L', categoryId: categories[0].id, brandId: null, unitId: units[2].id, supplierId: suppliers[0].id, costPrice: 1.00, sellingPrice: 2.00, taxRate: 10, minStock: 30, maxStock: 300 },
    { sku: 'SNK-004', barcode: '4902102113481', name: 'Chocolate Bar 100g', categoryId: categories[1].id, brandId: null, unitId: units[0].id, supplierId: suppliers[1].id, costPrice: 0.50, sellingPrice: 1.00, taxRate: 10, minStock: 50, maxStock: 500 },
    { sku: 'SNK-005', barcode: '4902102113498', name: 'Peanuts 200g', categoryId: categories[1].id, brandId: null, unitId: units[3].id, supplierId: suppliers[1].id, costPrice: 0.60, sellingPrice: 1.25, taxRate: 10, minStock: 30, maxStock: 300 },
    { sku: 'BRD-001', barcode: '4902102113504', name: 'White Bread Loaf', categoryId: categories[10].id, brandId: null, unitId: units[0].id, supplierId: suppliers[1].id, costPrice: 0.50, sellingPrice: 1.00, taxRate: 0, minStock: 30, maxStock: 300 },
    { sku: 'BRD-002', barcode: '4902102113511', name: 'Whole Wheat Bread', categoryId: categories[10].id, brandId: null, unitId: units[0].id, supplierId: suppliers[1].id, costPrice: 0.60, sellingPrice: 1.25, taxRate: 0, minStock: 20, maxStock: 200 },
    { sku: 'FRZ-001', barcode: '4902102113528', name: 'Frozen Pizza 400g', categoryId: categories[11].id, brandId: null, unitId: units[0].id, supplierId: suppliers[1].id, costPrice: 2.00, sellingPrice: 3.75, taxRate: 10, minStock: 15, maxStock: 150 },
    { sku: 'FRZ-002', barcode: '4902102113535', name: 'Frozen Vegetables 500g', categoryId: categories[11].id, brandId: null, unitId: units[3].id, supplierId: suppliers[1].id, costPrice: 1.00, sellingPrice: 2.00, taxRate: 5, minStock: 20, maxStock: 200 },
    { sku: 'FRZ-003', barcode: '4902102113542', name: 'Ice Cream 1L', categoryId: categories[11].id, brandId: null, unitId: units[0].id, supplierId: suppliers[4].id, costPrice: 1.50, sellingPrice: 3.00, taxRate: 10, minStock: 20, maxStock: 200 },
    { sku: 'DAI-004', barcode: '4902102113559', name: 'Butter 250g', categoryId: categories[8].id, brandId: brands[10].id, unitId: units[0].id, supplierId: suppliers[4].id, costPrice: 1.20, sellingPrice: 2.25, taxRate: 0, minStock: 20, maxStock: 200 },
    { sku: 'HH-003', barcode: '4902102113566', name: 'Aluminum Foil 30m', categoryId: categories[7].id, brandId: null, unitId: units[0].id, supplierId: suppliers[2].id, costPrice: 1.00, sellingPrice: 2.00, taxRate: 10, minStock: 15, maxStock: 150 },
    { sku: 'CLN-004', barcode: '4902102113573', name: 'Glass Cleaner 500ml', categoryId: categories[5].id, brandId: null, unitId: units[5].id, supplierId: suppliers[2].id, costPrice: 0.90, sellingPrice: 1.75, taxRate: 10, minStock: 20, maxStock: 200 },
    { sku: 'PER-004', barcode: '4902102113580', name: 'Hand Soap 250ml', categoryId: categories[6].id, brandId: null, unitId: units[5].id, supplierId: suppliers[2].id, costPrice: 0.60, sellingPrice: 1.25, taxRate: 10, minStock: 30, maxStock: 300 },
    { sku: 'BEV-008', barcode: '4902102113597', name: 'Green Tea 500ml', categoryId: categories[0].id, brandId: null, unitId: units[5].id, supplierId: suppliers[0].id, costPrice: 0.40, sellingPrice: 0.90, taxRate: 10, minStock: 40, maxStock: 400 },
    { sku: 'SNK-006', barcode: '4902102113603', name: 'Popcorn 100g', categoryId: categories[1].id, brandId: null, unitId: units[3].id, supplierId: suppliers[1].id, costPrice: 0.30, sellingPrice: 0.75, taxRate: 10, minStock: 40, maxStock: 400 },
    { sku: 'RIC-003', barcode: '4902102113610', name: 'Brown Rice 2kg', categoryId: categories[2].id, brandId: null, unitId: units[7].id, supplierId: suppliers[3].id, costPrice: 2.50, sellingPrice: 4.00, taxRate: 0, minStock: 15, maxStock: 150 },
    { sku: 'NDL-004', barcode: '4902102113627', name: 'Korean Ramen 5-Pack', categoryId: categories[4].id, brandId: null, unitId: units[3].id, supplierId: suppliers[3].id, costPrice: 2.00, sellingPrice: 3.50, taxRate: 10, minStock: 30, maxStock: 300 },
    { sku: 'CAN-004', barcode: '4902102113634', name: 'Canned Tomato 400g', categoryId: categories[9].id, brandId: brands[11].id, unitId: units[6].id, supplierId: suppliers[3].id, costPrice: 0.35, sellingPrice: 0.80, taxRate: 5, minStock: 40, maxStock: 400 },
    { sku: 'SAU-003', barcode: '4902102113641', name: 'Tomato Ketchup 500ml', categoryId: categories[3].id, brandId: null, unitId: units[5].id, supplierId: suppliers[3].id, costPrice: 0.70, sellingPrice: 1.40, taxRate: 5, minStock: 25, maxStock: 250 },
    { sku: 'HH-004', barcode: '4902102113658', name: 'Sponges 3-Pack', categoryId: categories[7].id, brandId: null, unitId: units[3].id, supplierId: suppliers[2].id, costPrice: 0.40, sellingPrice: 0.90, taxRate: 10, minStock: 30, maxStock: 300 },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: p,
    });

    await prisma.inventory.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        currentQuantity: Math.floor(Math.random() * 100) + 10,
        totalReceived: 0,
        totalSold: 0,
        totalAdjusted: 0,
      },
    });
  }

  // Expense Categories
  await Promise.all([
    prisma.expenseCategory.upsert({ where: { name: 'Rent' }, update: {}, create: { name: 'Rent', description: 'Monthly rent' } }),
    prisma.expenseCategory.upsert({ where: { name: 'Electricity' }, update: {}, create: { name: 'Electricity', description: 'Electric bills' } }),
    prisma.expenseCategory.upsert({ where: { name: 'Internet' }, update: {}, create: { name: 'Internet', description: 'Internet service' } }),
    prisma.expenseCategory.upsert({ where: { name: 'Salaries' }, update: {}, create: { name: 'Salaries', description: 'Employee salaries' } }),
    prisma.expenseCategory.upsert({ where: { name: 'Transportation' }, update: {}, create: { name: 'Transportation', description: 'Delivery and transport' } }),
    prisma.expenseCategory.upsert({ where: { name: 'Maintenance' }, update: {}, create: { name: 'Maintenance', description: 'Equipment maintenance' } }),
    prisma.expenseCategory.upsert({ where: { name: 'Marketing' }, update: {}, create: { name: 'Marketing', description: 'Advertising and promotions' } }),
    prisma.expenseCategory.upsert({ where: { name: 'Other' }, update: {}, create: { name: 'Other', description: 'Miscellaneous expenses' } }),
  ]);

  // Settings
  const defaultSettings = [
    { key: 'storeName', value: 'RetailERP Supermarket', group: 'store' },
    { key: 'storeAddress', value: '123 Main Street, City, State 12345', group: 'store' },
    { key: 'storePhone', value: '555-0100', group: 'store' },
    { key: 'storeEmail', value: 'contact@retailerp.com', group: 'store' },
    { key: 'currency', value: 'USD', group: 'store' },
    { key: 'currencySymbol', value: '$', group: 'store' },
    { key: 'taxRate', value: 10, group: 'pos' },
    { key: 'invoicePrefix', value: 'INV', group: 'pos' },
    { key: 'lowStockThreshold', value: 10, group: 'inventory' },
    { key: 'allowNegativeInventory', value: false, group: 'inventory' },
    { key: 'loyaltyRate', value: 1, group: 'store' },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log('Seed completed!');
  console.log('Demo accounts:');
  console.log('  admin@example.com / admin123');
  console.log('  manager@example.com / manager123');
  console.log('  cashier@example.com / cashier123');
  console.log('  inventory@example.com / inventory123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
