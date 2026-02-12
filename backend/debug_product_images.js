const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const path = require('path');
require('dotenv').config();

const checkLastProduct = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const product = await Product.findById('697e6e2bd67dd119dae26750');
        if (product) {
            console.log('Last Product:', product.name);
            console.log('Images:', product.images);
            console.log('JSON Output:', JSON.stringify(product.toJSON().images, null, 2));
        } else {
            console.log('No products found');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkLastProduct();
