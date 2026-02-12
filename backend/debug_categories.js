const mongoose = require('mongoose');
require('dotenv').config();

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    isActive: { type: Boolean, default: true },
    image: String
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);

const debugCategories = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        console.log('Fetching all categories...');
        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories.`);

        if (categories.length > 0) {
            console.log('Sample categories:');
            categories.forEach(c => {
                console.log(`- ID: ${c._id}, Name: ${c.name}, Active: ${c.isActive}`);
            });
        } else {
            console.log('No categories found in DB.');
        }

        mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

debugCategories();
