const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

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
