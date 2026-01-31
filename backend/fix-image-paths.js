const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./src/models/Product');

const fixPaths = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({});
        console.log(`Checking ${products.length} products...`);

        let updatedCount = 0;
        for (const product of products) {
            console.log(`Checking: ${product.name}, Images: ${JSON.stringify(product.images)}`);
            let changed = false;
            const newImages = product.images.map(img => {
                if (img && (img.includes(':\\') || img.includes(':/') || img.toLowerCase().startsWith('c:') || img.toLowerCase().startsWith('d:'))) {
                    console.log(`  Possible absolute path: ${img}`);
                    // It's an absolute path, let's make it relative
                    const uploadsIndex = img.indexOf('uploads');
                    if (uploadsIndex !== -1) {
                        changed = true;
                        const rel = img.substring(uploadsIndex).replace(/\\/g, '/');
                        console.log(`  Fixed to: ${rel}`);
                        return rel;
                    }
                }
                return img;
            });

            if (changed) {
                product.images = newImages;
                await product.save();
                updatedCount++;
                console.log(`Updated paths for: ${product.name}`);
            }
        }

        console.log(`Finished! Updated ${updatedCount} products.`);
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

fixPaths();
