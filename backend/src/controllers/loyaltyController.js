const LoyaltyPoint = require('../models/LoyaltyPoint');
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');

// Points calculation
const POINTS_PER_DOLLAR = 10; // 10 points per $1 spent
const POINTS_EXPIRY_DAYS = 365; // Points expire after 1 year

/**
 * @desc    Get user's loyalty points
 * @route   GET /api/loyalty
 * @access  Private
 */
const getLoyaltyPoints = async (req, res, next) => {
    try {
        let loyalty = await LoyaltyPoint.findOne({ user: req.user._id });

        if (!loyalty) {
            loyalty = await LoyaltyPoint.create({
                user: req.user._id,
                points: 0
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { loyalty }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get loyalty leaderboard
 * @route   GET /api/loyalty/leaderboard
 * @access  Public
 */
const getLeaderboard = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;
        const limitNum = Math.min(parseInt(limit) || 10, 50);

        const leaderboard = await LoyaltyPoint.find()
            .populate('user', 'name email')
            .sort({ totalEarned: -1 })
            .limit(limitNum)
            .select('user points totalEarned tier');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { leaderboard }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Award points for order (called after order completion)
 */
const awardPointsForOrder = async (userId, order) => {
    try {
        let loyalty = await LoyaltyPoint.findOne({ user: userId });

        if (!loyalty) {
            loyalty = await LoyaltyPoint.create({ user: userId });
        }

        const pointsEarned = Math.floor(order.total * POINTS_PER_DOLLAR);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + POINTS_EXPIRY_DAYS);

        loyalty.points += pointsEarned;
        loyalty.totalEarned += pointsEarned;
        loyalty.transactions.push({
            type: 'earned',
            amount: pointsEarned,
            description: `Points earned for order ${order.orderNumber}`,
            order: order._id,
            expiresAt
        });

        loyalty.updateTier();
        await loyalty.save();

        return pointsEarned;
    } catch (error) {
        console.error('Error awarding loyalty points:', error);
        return 0;
    }
};

/**
 * Redeem points (convert to discount)
 */
const redeemPoints = async (userId, pointsToRedeem) => {
    try {
        const loyalty = await LoyaltyPoint.findOne({ user: userId });

        if (!loyalty || loyalty.points < pointsToRedeem) {
            return { success: false, message: 'Insufficient points' };
        }

        loyalty.points -= pointsToRedeem;
        loyalty.totalSpent += pointsToRedeem;
        loyalty.transactions.push({
            type: 'spent',
            amount: pointsToRedeem,
            description: `Redeemed ${pointsToRedeem} points`,
            expiresAt: null
        });

        await loyalty.save();

        // Convert points to discount (100 points = $1)
        const discountAmount = pointsToRedeem / 100;

        return {
            success: true,
            discountAmount,
            remainingPoints: loyalty.points
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

module.exports = {
    getLoyaltyPoints,
    getLeaderboard,
    awardPointsForOrder,
    redeemPoints
};
