const { body, param, query } = require('express-validator');
const { PRODUCT_TYPES, PLATFORMS, REGIONS, PAYMENT_METHODS, ORDER_STATUS, DISCOUNT_TYPES } = require('./constants');

/**
 * Auth Validators
 */
const signupValidator = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('phone').trim().notEmpty().withMessage('Phone number is required')
];

const loginValidator = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

const verifyEmailValidator = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
];

/**
 * Product Validators
 */
const createProductValidator = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('discountPrice').optional().isFloat({ min: 0 }).withMessage('Discount price must be a positive number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('type').isIn(Object.values(PRODUCT_TYPES)).withMessage('Invalid product type'),
    body('platform').optional().isIn(Object.values(PLATFORMS)).withMessage('Invalid platform'),
    body('region').optional().isIn(Object.values(REGIONS)).withMessage('Invalid region'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

const updateProductValidator = [
    param('id').isMongoId().withMessage('Invalid product ID'),
    body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

/**
 * Category Validators
 */
const createCategoryValidator = [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('description').optional().trim()
];

const updateCategoryValidator = [
    param('id').isMongoId().withMessage('Invalid category ID'),
    body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty')
];

/**
 * Cart Validators
 */
const addToCartValidator = [
    body('productId').isMongoId().withMessage('Invalid product ID'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

const updateCartValidator = [
    param('itemId').isMongoId().withMessage('Invalid item ID'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

/**
 * Order Validators
 */
const createOrderValidator = [
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('paymentMethod').isIn(Object.values(PAYMENT_METHODS)).withMessage('Invalid payment method')
];

const updateOrderStatusValidator = [
    param('id').isMongoId().withMessage('Invalid order ID'),
    body('status').isIn(Object.values(ORDER_STATUS)).withMessage('Invalid order status')
];

/**
 * Payment Validators
 */
const submitPaymentValidator = [
    body('orderId').isMongoId().withMessage('Invalid order ID'),
    body('paymentMethod').isIn(Object.values(PAYMENT_METHODS)).withMessage('Invalid payment method'),
    body('phoneNumber').trim().notEmpty().withMessage('Phone number is required')
];

/**
 * Promo Code Validators
 */
const createPromoCodeValidator = [
    body('code').trim().notEmpty().withMessage('Promo code is required'),
    body('discountType').isIn(Object.values(DISCOUNT_TYPES)).withMessage('Invalid discount type'),
    body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be positive'),
    body('expirationDate').isISO8601().withMessage('Valid expiration date is required'),
    body('usageLimit').optional().isInt({ min: 1 }).withMessage('Usage limit must be at least 1')
];

const validatePromoCodeValidator = [
    body('code').trim().notEmpty().withMessage('Promo code is required')
];

/**
 * Common Validators
 */
const mongoIdValidator = [
    param('id').isMongoId().withMessage('Invalid ID')
];

const paginationValidator = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000')
];

module.exports = {
    signupValidator,
    loginValidator,
    verifyEmailValidator,
    createProductValidator,
    updateProductValidator,
    createCategoryValidator,
    updateCategoryValidator,
    addToCartValidator,
    updateCartValidator,
    createOrderValidator,
    updateOrderStatusValidator,
    submitPaymentValidator,
    createPromoCodeValidator,
    validatePromoCodeValidator,
    mongoIdValidator,
    paginationValidator
};
