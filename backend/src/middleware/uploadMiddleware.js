const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { generateUniqueFilename } = require('../utils/helpers');

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';

        // Determine upload path based on fieldname
        if (file.fieldname === 'productImages' || file.fieldname === 'productImage') {
            uploadPath += 'products/';
        } else if (file.fieldname === 'bannerImage' || file.fieldname === 'bannerImages') {
            uploadPath += 'banners/';
        } else if (file.fieldname === 'proofImage' || file.fieldname === 'paymentProof') {
            uploadPath += 'payments/';
        } else if (file.fieldname === 'categoryImage') {
            uploadPath += 'categories/';
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = generateUniqueFilename(file.originalname);
        cb(null, uniqueName);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new AppError('Only image files are allowed (jpeg, jpg, png, gif, webp)', HTTP_STATUS.BAD_REQUEST), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
    },
    fileFilter: fileFilter
});

/**
 * Upload single image
 */
const uploadSingle = (fieldName) => upload.single(fieldName);

/**
 * Upload multiple images
 */
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

/**
 * Upload multiple fields
 */
const uploadFields = (fields) => upload.fields(fields);

module.exports = {
    upload,
    uploadSingle,
    uploadMultiple,
    uploadFields
};
