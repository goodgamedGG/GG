const User = require('../models/User');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { generateToken } = require('../services/tokenService');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError('Email already registered', HTTP_STATUS.CONFLICT));
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone
        });

        // Generate verification code
        const verificationCode = user.generateVerificationCode();
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(email, name, verificationCode);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue even if email fails
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Account created successfully. Please check your email for verification code.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isEmailVerified: user.isEmailVerified
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return next(new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED));
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            return next(new AppError('Invalid credentials', HTTP_STATUS.UNAUTHORIZED));
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify email with code
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = async (req, res, next) => {
    try {
        const { email, code } = req.body;

        // Find user
        const user = await User.findOne({ email }).select('+verificationCode +verificationCodeExpires');
        if (!user) {
            return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Email already verified'
            });
        }

        // Check verification code
        if (user.verificationCode !== code) {
            return next(new AppError('Invalid verification code', HTTP_STATUS.BAD_REQUEST));
        }

        // Check if code expired
        if (user.verificationCodeExpires < Date.now()) {
            return next(new AppError('Verification code has expired', HTTP_STATUS.BAD_REQUEST));
        }

        // Verify email
        user.isEmailVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Email verified successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Resend verification code
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
const resendVerificationCode = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return next(new AppError('Email already verified', HTTP_STATUS.BAD_REQUEST));
        }

        // Generate new verification code
        const verificationCode = user.generateVerificationCode();
        await user.save();

        // Send verification email
        try {
            await sendVerificationEmail(email, user.name, verificationCode);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return next(new AppError('Failed to send verification email', HTTP_STATUS.INTERNAL_SERVER_ERROR));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Verification code sent to your email'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
        }

        // Generate reset token
        const resetToken = generateToken(user._id);
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send reset email
        try {
            await sendPasswordResetEmail(email, user.name, resetToken);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            return next(new AppError('Failed to send reset email', HTTP_STATUS.INTERNAL_SERVER_ERROR));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Password reset link sent to your email'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return next(new AppError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST));
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Password reset successful'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    signup,
    login,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    resetPassword
};
