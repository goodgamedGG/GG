const express = require('express');
const router = express.Router();
const {
    getLoyaltyPoints,
    getLeaderboard
} = require('../controllers/loyaltyController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { paginationValidator } = require('../utils/validators');

// @route   GET /api/loyalty/leaderboard
router.get('/leaderboard', paginationValidator, validate, getLeaderboard);

// @route   GET /api/loyalty
router.get('/', protect, getLoyaltyPoints);

module.exports = router;
