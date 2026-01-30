const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
    try {
        // Connection options to handle DNS issues
        const options = {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4, skip trying IPv6
        };

        logger.info('Attempting MongoDB connection...');
        const conn = await mongoose.connect(process.env.MONGO_URI, options);

        logger.info('MongoDB Connected', {
            host: conn.connection.host,
            database: conn.connection.name
        });

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB connection error', { error: err.message, stack: err.stack });
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        logger.error('MongoDB connection failed', { error: error.message, stack: error.stack });
        process.exit(1);
    }
};

module.exports = connectDB;
