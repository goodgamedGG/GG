const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    changePassword,
    getAllUsers,
    updateUserRole
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { userApiLimiter, adminLimiter } = require('../middleware/rateLimitMiddleware');

// Apply user-based rate limiting to all routes
router.use(protect, userApiLimiter);

// Admin routes use admin limiter
router.use('/:id/role', adminLimiter);

// @route   GET /api/users/profile
router.get('/profile', protect, getProfile);

// @route   PUT /api/users/profile
router.put('/profile', protect, updateProfile);

// @route   PUT /api/users/change-password
router.put('/change-password', protect, changePassword);

// Admin routes
// @route   GET /api/users
router.get('/', protect, requireAdmin, getAllUsers);

// @route   PUT /api/users/:id/role
router.put('/:id/role', protect, requireAdmin, updateUserRole);

module.exports = router;
