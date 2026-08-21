const prisma = require('../config/database');

const getAll = async () => {
  const settings = await prisma.setting.findMany();
  return settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});
};

const update = async (data) => {
  const results = {};
  for (const [key, value] of Object.entries(data)) {
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value, group: 'general' },
    });
    results[setting.key] = setting.value;
  }
  return results;
};

module.exports = { getAll, update };
