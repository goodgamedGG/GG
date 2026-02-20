require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const verifyRemoval = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        const adminEmail = 'admin@gamingstore.com';
        const user = await User.findOne({ email: adminEmail });

        if (!user) {
            console.log(`✅ SUCCESS: User with email ${adminEmail} not found in database.`);
        } else {
            console.error(`❌ FAILURE: User with email ${adminEmail} STILL EXISTS in database.`);
            process.exit(1);
        }

        console.log('ℹ️ Checking environment variables...');
        if (!process.env.ADMIN_EMAIL && !process.env.ADMIN_PASSWORD) {
            console.log('✅ SUCCESS: ADMIN_EMAIL and ADMIN_PASSWORD are not set in environment.');
        } else {
            console.warn('⚠️ WARNING: ADMIN_EMAIL or ADMIN_PASSWORD are still set in process.env (check .env file or current shell session).');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error during verification:', error.message);
        process.exit(1);
    }
};

verifyRemoval();
