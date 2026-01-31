const mongoose = require('mongoose');
require('dotenv').config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const testUri = process.env.MONGO_URI.replace(/\/[^/?]+(\?|$)/, '/test$1');
        const conn = await mongoose.createConnection(testUri).asPromise();

        const products = await conn.db.collection('products').find({}).toArray();
        console.log(`Found ${products.length} products`);
        console.log(JSON.stringify(products, null, 2));

        await conn.close();
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

debug();
