require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const User = require('./src/models/User');
const Order = require('./src/models/Order');
const Category = require('./src/models/Category');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB:', mongoose.connection.name);

        const products = await Product.countDocuments();
        const users = await User.countDocuments();
        const orders = await Order.countDocuments();
        const categories = await Category.countDocuments();

        console.log('--- DB SUMMARY ---');
        console.log('Products:', products);
        console.log('Users:', users);
        console.log('Orders:', orders);
        console.log('Categories:', categories);

        if (products > 0) {
            const firstProduct = await Product.findOne();
            console.log('Sample Product:', firstProduct.name);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error checking DB:', err);
        process.exit(1);
    }
};

checkDB();
