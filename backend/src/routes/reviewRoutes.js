const express = require('express');
const router = express.Router();
const {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { mongoIdValidator, paginationValidator } = require('../utils/validators');
const { body } = require('express-validator');

// @route   GET /api/reviews/product/:productId
router.get(
    '/product/:productId',
    mongoIdValidator,
    paginationValidator,
    validate,
    getProductReviews
);

// Protected routes
router.use(protect);

// @route   POST /api/reviews
router.post(
    '/',
    [
        body('productId').isMongoId().withMessage('Valid product ID is required'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('title').optional().trim().isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
        body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters')
    ],
    validate,
    createReview
);

// @route   PUT /api/reviews/:id
router.put(
    '/:id',
    mongoIdValidator,
    [
        body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('title').optional().trim().isLength({ max: 100 }).withMessage('Title must be less than 100 characters'),
        body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters')
    ],
    validate,
    updateReview
);

// @route   DELETE /api/reviews/:id
router.delete('/:id', mongoIdValidator, validate, deleteReview);

module.exports = router;
