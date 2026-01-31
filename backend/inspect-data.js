const mongoose = require('mongoose');
require('dotenv').config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const testUri = process.env.MONGO_URI.replace(/\/[^/?]+(\?|$)/, '/test$1');
        const conn = await mongoose.createConnection(testUri).asPromise();

        const categories = await conn.db.collection('categories').find({}).toArray();
        for (const c of categories) {
            console.log(`- Category: ${c.name}, Image: ${c.image}`);
        }

        await conn.close();
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

debug();
