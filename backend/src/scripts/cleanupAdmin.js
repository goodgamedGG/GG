require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const cleanupAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        const adminEmail = 'admin@gamingstore.com';

        const result = await User.deleteOne({ email: adminEmail });

        if (result.deletedCount > 0) {
            console.log(`✅ Default admin account (${adminEmail}) deleted from database.`);
        } else {
            console.log(`ℹ️  No user found with email ${adminEmail}.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

cleanupAdmin();
