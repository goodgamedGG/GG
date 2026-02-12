const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./src/models/Product');
const Category = require('./src/models/Category');

const debugValidation = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // Get a category
        const category = await Category.findOne();
        if (!category) {
            console.log('No category found. Cannot test product creation.');
            return;
        }
        console.log('Using category:', category._id);

        const testData = {
            name: 'Debug Product',
            description: 'Testing validation',
            price: 100,
            category: category._id,
            stock: 5,
            type: 'game',
            platform: 'PC',
            region: 'Middle East', // Testing this specific value
            isActive: true
        };

        console.log('Attempting to create product with:', testData);
        const product = await Product.create(testData);
        console.log('Product created successfully:', product._id);

    } catch (error) {
        console.error('Validation Error:', error.message);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`- ${key}: ${error.errors[key].message}`);
                console.error(`  Value: ${error.errors[key].value}`);
                console.error(`  Kind: ${error.errors[key].kind}`);
            });
        }
    } finally {
        await mongoose.disconnect();
    }
};

debugValidation();
