const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
    createCategoryValidator,
    updateCategoryValidator,
    mongoIdValidator
} = require('../utils/validators');

// Public routes
// @route   GET /api/categories
router.get('/', getCategories);

// @route   GET /api/categories/:id
router.get('/:id', mongoIdValidator, validate, getCategoryById);

// Admin routes
// @route   POST /api/categories
router.post(
    '/',
    protect,
    requireAdmin,
    uploadSingle('image'),
    require('../middleware/uploadMiddleware').processUploadedImages,
    createCategoryValidator,
    validate,
    createCategory
);

// @route   PUT /api/categories/:id
router.put(
    '/:id',
    protect,
    requireAdmin,
    uploadSingle('image'),
    require('../middleware/uploadMiddleware').processUploadedImages,
    updateCategoryValidator,
    validate,
    updateCategory
);

// @route   DELETE /api/categories/:id
router.delete('/:id', protect, requireAdmin, mongoIdValidator, validate, deleteCategory);

// @route   PATCH /api/categories/:id/toggle
router.patch('/:id/toggle', protect, requireAdmin, mongoIdValidator, validate, toggleCategoryStatus);

module.exports = router;
