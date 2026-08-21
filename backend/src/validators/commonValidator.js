const { body } = require('express-validator');

const productCreateValidator = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('sku').notEmpty().withMessage('SKU is required'),
];

const customerCreateValidator = [
  body('name').notEmpty().withMessage('Customer name is required'),
];

const supplierCreateValidator = [
  body('companyName').notEmpty().withMessage('Company name is required'),
];

const expenseCreateValidator = [
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('amount').notEmpty().withMessage('Amount is required').isNumeric().withMessage('Amount must be a number'),
];

const userCreateValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('roleId').notEmpty().withMessage('Role is required'),
];

module.exports = {
  productCreateValidator,
  customerCreateValidator,
  supplierCreateValidator,
  expenseCreateValidator,
  userCreateValidator,
};
