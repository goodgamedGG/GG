const express = require('express');
const router = express.Router();
const {
    createOrder,
    getOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} = require('../controllers/orderController');
const { protect, requireEmailVerification } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
    createOrderValidator,
    updateOrderStatusValidator,
    mongoIdValidator,
    paginationValidator
} = require('../utils/validators');

// User routes (require email verification)
// @route   POST /api/orders
router.post('/', protect, requireEmailVerification, createOrderValidator, validate, createOrder);

// @route   GET /api/orders
router.get('/', protect, requireEmailVerification, paginationValidator, validate, getOrders);

// @route   GET /api/orders/:id
router.get('/:id', protect, requireEmailVerification, mongoIdValidator, validate, getOrderById);

// @route   PATCH /api/orders/:id/cancel
router.patch('/:id/cancel', protect, requireEmailVerification, mongoIdValidator, validate, cancelOrder);

// Admin routes
// @route   GET /api/orders/admin/all
router.get('/admin/all', protect, requireAdmin, paginationValidator, validate, getAllOrders);

// @route   PATCH /api/orders/:id/status
router.patch('/:id/status', protect, requireAdmin, updateOrderStatusValidator, validate, updateOrderStatus);

module.exports = router;
