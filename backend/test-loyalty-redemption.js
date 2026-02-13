const mongoose = require('mongoose');
const User = require('./src/models/User');
const LoyaltyPoint = require('./src/models/LoyaltyPoint');
const Product = require('./src/models/Product');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const TEST_EMAIL = 'youssefpls9@gmail.com';
const TEST_PASSWORD = 'password123';

async function runTest() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        // 1. Seed Points
        const user = await User.findOne({ email: TEST_EMAIL });
        if (!user) {
            console.error('User not found:', TEST_EMAIL);
            process.exit(1);
        }

        console.log(`User found: ${user._id}`);

        let loyalty = await LoyaltyPoint.findOne({ user: user._id });
        if (!loyalty) {
            loyalty = await LoyaltyPoint.create({ user: user._id, points: 0 });
        }

        loyalty.points = 5000;
        loyalty.totalEarned = 5000;
        await loyalty.save();
        console.log('Seeded 5000 loyalty points.');

        // 2. Login
        console.log('Logging in...');
        const loginUrl = 'http://127.0.0.1:5000/api/users/login';
        try {
            const loginRes = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
            });

            if (!loginRes.ok) {
                console.error('Login failed status:', loginRes.status);
                console.error('Login failed text:', await loginRes.text());
                process.exit(1);
            }

            const loginData = await loginRes.json();
            const token = loginData.token;
            console.log('Logged in. Token acquired.');

            // 3. Add item to cart
            const product = await Product.findOne({ isActive: true });
            if (!product) {
                console.error('No active products found.');
                process.exit(1);
            }

            console.log(`Adding product ${product.name} (${product.price} EGP) to cart...`);
            const cartRes = await fetch('http://127.0.0.1:5000/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId: product._id, quantity: 1 })
            });

            if (!cartRes.ok) {
                console.error('Add to cart failed:', await cartRes.text());
            } else {
                console.log('Item added to cart.');
            }

            // 4. Redeem Points
            console.log('Redeeming 100 points...');
            const redeemRes = await fetch('http://127.0.0.1:5000/api/cart/redeem-points', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ points: 100 })
            });

            const redeemData = await redeemRes.json();
            if (!redeemRes.ok) {
                console.error('Redemption failed:', JSON.stringify(redeemData, null, 2));
            } else {
                console.log('Redemption successful!');
                console.log('Points Used:', redeemData.data.cart.pointsUsed);
                console.log('Points Discount:', redeemData.data.cart.pointsDiscount);
            }

            // 5. Verify Cart Total
            const cartGetRes = await fetch('http://127.0.0.1:5000/api/cart', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const cartData = await cartGetRes.json();
            console.log('Final Cart Total:', cartData.data.cart.total);

            console.log('Test Complete.');
            process.exit(0);

        } catch (fetchError) {
            console.error('Fetch error:', fetchError);
            process.exit(1);
        }

    } catch (error) {
        console.error('Test Error:', error);
        process.exit(1);
    }
}

runTest();
