const { body } = require('express-validator');

// Reusable field rules
const aadharField = body('aadharCardNumber')
  .matches(/^[2-9]{1}[0-9]{11}$/)
  .withMessage('Aadhar number must be a 12-digit number starting from 2-9');

const passwordField = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long');

const emailField = body('email')
  .isEmail()
  .withMessage('Invalid email');

const roleField = body('role')
  .optional()
  .isIn(['voter', 'admin'])
  .withMessage('Role must be either voter or admin');

// Composed validation arrays
const validateSignup = [emailField, passwordField, roleField, aadharField];
const validateLogin = [aadharField, passwordField];

module.exports = {
  validateSignup,
  validateLogin
};
