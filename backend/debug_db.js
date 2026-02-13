const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const Payment = require('./src/models/Payment');
const Product = require('./src/models/Product');
require('dotenv').config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const order = await Order.findOne().sort({ createdAt: -1 })
            .populate('payment')
            .populate('items.product');

        if (!order) {
            console.log('No orders found');
        } else {
            console.log('Latest Order:', JSON.stringify(order.toJSON(), null, 2));
            if (order.payment) {
                console.log('Payment Proof Image:', order.payment.proofImage);
            } else {
                console.log('Payment field is null/undefined');
            }

            if (order.items.length > 0) {
                console.log('First Item Product Images:', order.items[0].product.images);
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

debug();
