// Utility Helper Functions

/**
 * Generate a random verification code
 * @param {number} length - Length of the code
 * @returns {string} - Random numeric code
 */
const generateVerificationCode = (length = 6) => {
    return Math.floor(Math.random() * Math.pow(10, length))
        .toString()
        .padStart(length, '0');
};

/**
 * Generate a unique order number
 * @returns {string} - Order number in format ORD-TIMESTAMP-RANDOM
 */
const generateOrderNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
};

/**
 * Calculate percentage discount
 * @param {number} price - Original price
 * @param {number} percentage - Discount percentage
 * @returns {number} - Discounted price
 */
const calculatePercentageDiscount = (price, percentage) => {
    return price - (price * percentage) / 100;
};

/**
 * Calculate fixed discount
 * @param {number} price - Original price
 * @param {number} amount - Discount amount
 * @returns {number} - Discounted price
 */
const calculateFixedDiscount = (price, amount) => {
    return Math.max(0, price - amount);
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: EGP)
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount, currency = 'EGP') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

/**
 * Sanitize filename for safe storage
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
const sanitizeFilename = (filename) => {
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
};

/**
 * Generate unique filename with timestamp
 * @param {string} originalName - Original filename
 * @returns {string} - Unique filename
 */
const generateUniqueFilename = (originalName) => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const ext = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(`.${ext}`, '');
    const sanitized = sanitizeFilename(nameWithoutExt);
    return `${sanitized}-${timestamp}-${random}.${ext}`;
};

/**
 * Check if date is expired
 * @param {Date} date - Date to check
 * @returns {boolean} - True if expired
 */
const isExpired = (date) => {
    return new Date(date) < new Date();
};

/**
 * Paginate results
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} - Skip and limit values
 */
const getPagination = (page = 1, limit = 10) => {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;
    return { skip, limit: limitNum, page: pageNum };
};

/**
 * Create pagination metadata
 * @param {number} total - Total items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} - Pagination metadata
 */
const createPaginationMeta = (total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
    };
};

module.exports = {
    generateVerificationCode,
    generateOrderNumber,
    calculatePercentageDiscount,
    calculateFixedDiscount,
    formatCurrency,
    sanitizeFilename,
    generateUniqueFilename,
    isExpired,
    getPagination,
    createPaginationMeta
};
