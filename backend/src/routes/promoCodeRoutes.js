const express = require('express');
const router = express.Router();
const {
    validatePromoCode,
    getPromoCodes,
    createPromoCode,
    updatePromoCode,
    deletePromoCode,
    togglePromoCodeStatus
} = require('../controllers/promoCodeController');
const { protect, requireEmailVerification } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
    createPromoCodeValidator,
    validatePromoCodeValidator,
    mongoIdValidator
} = require('../utils/validators');

// User routes
// @route   POST /api/promo-codes/validate
router.post('/validate', protect, requireEmailVerification, validatePromoCodeValidator, validate, validatePromoCode);

// Admin routes
// @route   GET /api/promo-codes
router.get('/', protect, requireAdmin, getPromoCodes);

// @route   POST /api/promo-codes
router.post('/', protect, requireAdmin, createPromoCodeValidator, validate, createPromoCode);

// @route   PUT /api/promo-codes/:id
router.put('/:id', protect, requireAdmin, mongoIdValidator, validate, updatePromoCode);

// @route   DELETE /api/promo-codes/:id
router.delete('/:id', protect, requireAdmin, mongoIdValidator, validate, deletePromoCode);

// @route   PATCH /api/promo-codes/:id/toggle
router.patch('/:id/toggle', protect, requireAdmin, mongoIdValidator, validate, togglePromoCodeStatus);

module.exports = router;
