const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const inspectUser = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const email = 'youssefpls9@gmail.com';
        const user = await mongoose.connection.db.collection('users').findOne({ email });

        if (!user) {
            console.log('User not found:', email);
        } else {
            console.log('User found:');
            console.log(JSON.stringify(user, null, 2));

            const loyalty = await mongoose.connection.db.collection('loyaltypoints').findOne({ user: user._id });
            console.log('Loyalty Points:', loyalty ? JSON.stringify(loyalty, null, 2) : 'None');
        }

        await mongoose.connection.close();
        console.log('Done.');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

inspectUser();
