require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { ensureUploadDirs } = require('./src/services/uploadService');
const User = require('./src/models/User');
const { USER_ROLES } = require('./src/utils/constants');

const PORT = process.env.PORT || 5000;

/**
 * Create default admin account if it doesn't exist
 */
const createDefaultAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!adminEmail) {
            console.warn('⚠️  ADMIN_EMAIL not set in environment variables');
            return;
        }

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('✅ Admin account already exists');
            return;
        }

        const admin = await User.create({
            name: process.env.ADMIN_NAME || 'Admin',
            email: adminEmail,
            password: process.env.ADMIN_PASSWORD || 'Admin@123456',
            phone: process.env.ADMIN_PHONE || '+1234567890',
            role: USER_ROLES.ADMIN,
            isEmailVerified: true
        });

        console.log('✅ Default admin account created');
        console.log(`   Email: ${admin.email}`);
    } catch (error) {
        console.error('❌ Error creating admin account:', error.message);
    }
};

/**
 * Start server
 */
const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Ensure upload directories exist
        await ensureUploadDirs();
        console.log('✅ Upload directories ready');

        // Create default admin
        await createDefaultAdmin();

        // Start server
        app.listen(PORT, () => {
            console.log('');
            console.log('='.repeat(50));
            console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
            console.log(`📡 Port: ${PORT}`);
            console.log(`🌐 URL: http://localhost:${PORT}`);
            console.log(`💚 Health: http://localhost:${PORT}/health`);
            console.log('='.repeat(50));
            console.log('');
        });
    } catch (error) {
        console.error('❌ Server startup failed:', error.message);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

// Start the server
startServer();
