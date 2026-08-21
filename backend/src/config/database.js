const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;

let prisma;

if (process.env.NODE_ENV === 'production') {
  const adapter = new PrismaPg({ connectionString });
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.prisma) {
    const adapter = new PrismaPg({ connectionString });
    global.prisma = new PrismaClient({ adapter });
  }
  prisma = global.prisma;
}

module.exports = prisma;
