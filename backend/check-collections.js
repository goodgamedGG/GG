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
                // Check for product 'k' to see its image path
                if (coll.name === 'products') {
                    const kProduct = await conn.db.collection(coll.name).findOne({ name: 'k' });
                    if (kProduct) {
                        console.log(`\n=== Product 'k' ===`);
                        console.log(JSON.stringify(kProduct, null, 2));
                    }
                }
            }

            // Create a test product to prove system is dynamic
            console.log('\n=== Creating Test Product ===');
            try {
                const testProduct = {
                    name: "Dynamic Test Product",
                    description: "This product was created programmatically to prove the system fetches from DB.",
                    price: 999,
                    category: new mongoose.Types.ObjectId("697919a1379258aa355451e2"), // Using FC24's category ID
                    stock: 5,
                    images: ["uploads/products/fc25-1769544965528-5503.jpg"], // Use the known working image
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                const result = await conn.db.collection('products').insertOne(testProduct);
                console.log('Test Product Created:', result.insertedId);
            } catch (e) {
                console.log('Error creating test product:', e.message);
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
