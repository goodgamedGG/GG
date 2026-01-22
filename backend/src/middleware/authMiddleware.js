const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Protect routes - Verify JWT token
 */
const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return next(
                new AppError('Not authorized to access this route', HTTP_STATUS.UNAUTHORIZED)
            );
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return next(
                    new AppError('User not found', HTTP_STATUS.UNAUTHORIZED)
                );
            }

            next();
        } catch (error) {
            return next(
                new AppError('Not authorized to access this route', HTTP_STATUS.UNAUTHORIZED)
            );
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Require email verification
 */
const requireEmailVerification = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return next(
            new AppError(
                'Please verify your email address to access this resource',
                HTTP_STATUS.FORBIDDEN
            )
        );
    }
    next();
};

module.exports = {
    protect,
    requireEmailVerification
};
