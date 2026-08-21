const prisma = require('../config/database');

const create = async (data) => prisma.expenseCategory.create({ data });
const getAll = async () => prisma.expenseCategory.findMany({ orderBy: { name: 'asc' } });
const update = async (id, data) => prisma.expenseCategory.update({ where: { id }, data });
const remove = async (id) => prisma.expenseCategory.delete({ where: { id } });

module.exports = { create, getAll, update, remove };
