const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} - JWT token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded token payload
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};

/**
 * Generate password reset token
 * @param {string} id - User ID
 * @returns {string} - Reset token
 */
const generateResetToken = (id) => {
    return jwt.sign({ id, type: 'reset' }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
};

module.exports = {
    generateToken,
    verifyToken,
    generateResetToken
};
