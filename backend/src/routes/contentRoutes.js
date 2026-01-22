const express = require('express');
const router = express.Router();
const {
    getBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    getFeaturedProducts,
    addFeaturedProduct,
    updateFeaturedProduct,
    removeFeaturedProduct
} = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validateMiddleware');
const { mongoIdValidator } = require('../utils/validators');

// ========== BANNER ROUTES ==========

// Public routes
// @route   GET /api/content/banners
router.get('/banners', getBanners);

// Admin routes
// @route   POST /api/content/banners
router.post('/banners', protect, requireAdmin, uploadSingle('bannerImage'), createBanner);

// @route   PUT /api/content/banners/:id
router.put('/banners/:id', protect, requireAdmin, uploadSingle('bannerImage'), mongoIdValidator, validate, updateBanner);

// @route   DELETE /api/content/banners/:id
router.delete('/banners/:id', protect, requireAdmin, mongoIdValidator, validate, deleteBanner);

// ========== FEATURED PRODUCT ROUTES ==========

// Public routes
// @route   GET /api/content/featured
router.get('/featured', getFeaturedProducts);

// Admin routes
// @route   POST /api/content/featured
router.post('/featured', protect, requireAdmin, addFeaturedProduct);

// @route   PUT /api/content/featured/:id
router.put('/featured/:id', protect, requireAdmin, mongoIdValidator, validate, updateFeaturedProduct);

// @route   DELETE /api/content/featured/:id
router.delete('/featured/:id', protect, requireAdmin, mongoIdValidator, validate, removeFeaturedProduct);

module.exports = router;
