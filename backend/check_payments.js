// Quick script to check MongoDB collections
require('dotenv').config();
const mongoose = require('mongoose');

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log('\n=== Collections in database ===');
        collections.forEach(col => {
            console.log(`- ${col.name}`);
        });

        // Check payments collection
        const Payment = require('./src/models/Payment');
        const paymentCount = await Payment.countDocuments();
        console.log(`\n=== Payments Collection ===`);
        console.log(`Total payments: ${paymentCount}`);

        if (paymentCount > 0) {
            const payments = await Payment.find().limit(5).populate('user', 'name email').populate('order', 'orderNumber');
            console.log('\nSample payments:');
            payments.forEach(p => {
                console.log(`- ID: ${p._id}, Order: ${p.order?.orderNumber}, Status: ${p.status}, Image: ${p.proofImage}`);
            });
        }

        await mongoose.connection.close();
        console.log('\nConnection closed');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDB();
