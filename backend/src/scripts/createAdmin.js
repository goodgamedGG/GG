require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { USER_ROLES } = require('../utils/constants');

/**
 * Script to manually create admin account
 * Usage: node src/scripts/createAdmin.js
 */
const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        const adminEmail = process.env.ADMIN_EMAIL;

        if (!adminEmail) {
            console.error('❌ ADMIN_EMAIL not set in environment variables');
            process.exit(1);
        }

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('⚠️  Admin account already exists');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Role: ${existingAdmin.role}`);
            process.exit(0);
        }

        // Create admin
        const admin = await User.create({
            name: process.env.ADMIN_NAME || 'Admin',
            email: adminEmail,
            password: process.env.ADMIN_PASSWORD || 'Admin@123456',
            phone: process.env.ADMIN_PHONE || '+1234567890',
            role: USER_ROLES.ADMIN,
            isEmailVerified: true
        });

        console.log('✅ Admin account created successfully');
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createAdmin();
