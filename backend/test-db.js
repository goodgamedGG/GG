// Direct MongoDB query test
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Get the products collection directly
        const db = mongoose.connection.db;
        const productsCollection = db.collection('products');

        console.log('\n=== Testing Direct MongoDB Query ===');
        const allProducts = await productsCollection.find({}).toArray();
        console.log('Total products in collection:', allProducts.length);
        console.log('Products:', JSON.stringify(allProducts, null, 2));

        // Test with Mongoose model
        console.log('\n=== Testing Mongoose Model ===');
        const Product = require('./src/models/Product');
        const modelProducts = await Product.find({});
        console.log('Products via Model:', modelProducts.length);
        console.log('Model Products:', JSON.stringify(modelProducts, null, 2));

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

connectDB();
