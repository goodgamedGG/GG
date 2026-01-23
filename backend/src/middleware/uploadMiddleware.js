const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('./errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { generateUniqueFilename } = require('../utils/helpers');

// Ensure upload directories exist
const ensureUploadDirs = () => {
    const dirs = [
        'uploads',
        'uploads/products',
        'uploads/banners',
        'uploads/payments',
        'uploads/categories'
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        }
    });
};

// Create directories on module load
ensureUploadDirs();

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';

        // Determine upload path based on fieldname
        if (file.fieldname === 'images' || file.fieldname === 'productImages' || file.fieldname === 'productImage') {
            uploadPath += 'products/';
        } else if (file.fieldname === 'bannerImage' || file.fieldname === 'bannerImages') {
            uploadPath += 'banners/';
        } else if (file.fieldname === 'proofImage' || file.fieldname === 'paymentProof') {
            uploadPath += 'payments/';
        } else if (file.fieldname === 'categoryImage' || file.fieldname === 'image') {
            uploadPath += 'categories/';
        }

        // Ensure the specific directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = generateUniqueFilename(file.originalname);
        cb(null, uniqueName);
    }
});

// File filter - support all common image types
const fileFilter = (req, file, cb) => {
    // Allowed file types - expanded to support more formats
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|bmp|ico|tiff|tif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|jpg|png|gif|webp|svg\+xml|bmp|x-icon|tiff)/.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new AppError('Only image files are allowed (jpeg, jpg, png, gif, webp, svg, bmp)', HTTP_STATUS.BAD_REQUEST), false);
    }
};

// Create multer upload instance
const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default (increased)
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
