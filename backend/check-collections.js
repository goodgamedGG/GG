// Check all collections and databases
const mongoose = require('mongoose');
require('dotenv').config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        console.log('Database name:', mongoose.connection.db.databaseName);

        const db = mongoose.connection.db;

        // List all collections
        const collections = await db.listCollections().toArray();
        console.log('\n=== All Collections ===');
        collections.forEach(coll => console.log(`- ${coll.name}`));

        // Check each collection for documents
        console.log('\n=== Document Counts ===');
        for (const coll of collections) {
            const count = await db.collection(coll.name).countDocuments();
            console.log(`${coll.name}: ${count} documents`);

            if (count > 0 && count < 10) {
                const docs = await db.collection(coll.name).find({}).limit(2).toArray();
                console.log(`  Sample:`, JSON.stringify(docs[0], null, 2).substring(0, 200));
            }
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDB();
