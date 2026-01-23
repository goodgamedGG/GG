const express = require('express');
const router = express.Router();
const {
    signup,
    login,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    verifyResetCode,
    resetPassword
} = require('../controllers/authController');
const validate = require('../middleware/validateMiddleware');
const {
    signupValidator,
    loginValidator,
    verifyEmailValidator
} = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimitMiddleware');

// Apply rate limiting to auth routes
router.use(authLimiter);

// @route   POST /api/auth/signup
router.post('/signup', signupValidator, validate, signup);

// @route   POST /api/auth/login
router.post('/login', loginValidator, validate, login);

// @route   POST /api/auth/verify-email
router.post('/verify-email', verifyEmailValidator, validate, verifyEmail);

// @route   POST /api/auth/resend-verification
router.post('/resend-verification', resendVerificationCode);

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/verify-reset-code
router.post('/verify-reset-code', verifyResetCode);

// @route   POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

module.exports = router;
