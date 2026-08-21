require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/units', require('./routes/units'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/expense-categories', require('./routes/expenseCategories'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users', require('./routes/users'));

app.use(errorHandler);

module.exports = app;
