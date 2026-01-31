const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({}).populate('category');
        console.log(`Found ${products.length} products`);
        products.forEach(p => {
            console.log(`- ${p.name}: Category: ${p.category ? p.category.name : 'NULL'} (${p.category ? p.category._id : 'N/A'})`);
        });
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

test();
