const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const login = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  if (!user.isActive) {
    throw Object.assign(new Error('Account is deactivated'), { statusCode: 401 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const { password: _, ...userWithoutPassword } = user;

  return { token, user: userWithoutPassword };
};

const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    throw Object.assign(new Error('User not found'), { statusCode: 404 });
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const register = async (data) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      roleId: data.roleId,
    },
    include: { role: true },
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

module.exports = { login, getCurrentUser, register };
