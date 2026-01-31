// Check all collections and databases
const mongoose = require('mongoose');
require('dotenv').config();

const checkDB = async () => {
    try {
        // Connect to the Cluster (admin database to list databases)
        // We need to remove the db name from URI to list databases generally, or connect to admin
        const uri = process.env.MONGO_URI;
        console.log('Current URI in .env:', uri);

        await mongoose.connect(uri);
        const currentDbName = mongoose.connection.db.databaseName;
        console.log('Connected to configured DB:', currentDbName);

        // Try to list all databases
        try {
            const admin = mongoose.connection.db.admin();
            const list = await admin.listDatabases();
            console.log('\n=== Databases in Cluster ===');
            list.databases.forEach(db => console.log(`- ${db.name} (Size: ${db.sizeOnDisk})`));
        } catch (e) {
            console.log('\nCould not list databases:', e.message);
        }

        // Check configured DB collections
        console.log(`\n=== Collections in ${currentDbName} ===`);
        const collections = await mongoose.connection.db.listCollections().toArray();
        for (const coll of collections) {
            const count = await mongoose.connection.db.collection(coll.name).countDocuments();
            console.log(`${coll.name}: ${count}`);
        }

        await mongoose.connection.close();

        // Check 'test' database if we were not already there
        if (currentDbName !== 'test') {
            // Replace database name in URI
            // URI format is usually: mongodb://user:pass@host/DBname?options
            // We'll replace the database name segment specifically
            const testUri = uri.replace(/\/[^/?]+(\?|$)/, '/test$1');

            console.log('\n=== Checking "test" database ===');
            // Use createConnection for isolation
            const conn = mongoose.createConnection(testUri);

            await new Promise((resolve, reject) => {
                conn.on('connected', resolve);
                conn.on('error', reject);
            });

            const testColls = await conn.db.listCollections().toArray();
            for (const coll of testColls) {
                const count = await conn.db.collection(coll.name).countDocuments();
                console.log(`${coll.name}: ${count}`);
                if (coll.name === 'products' && count > 0) {
                    const docs = await conn.db.collection(coll.name).find({}).limit(1).toArray();
                    console.log(`  Sample Product:`, JSON.stringify(docs[0], null, 2).substring(0, 300));
                }
            }
            await conn.close();
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDB();
