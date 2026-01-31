const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { AppError } = require('./errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { generateUniqueFilename } = require('../utils/helpers');
const logger = require('../utils/logger');

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
            logger.info(`Created upload directory: ${dir}`);
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

/**
 * Magic byte validation - verify actual file type
 */
const validateFileType = (buffer) => {
    // Check magic bytes (file signatures)
    const signatures = {
        'image/jpeg': [0xFF, 0xD8, 0xFF],
        'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
        'image/gif': [0x47, 0x49, 0x46, 0x38],
        'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header
        'image/svg+xml': [0x3C, 0x3F, 0x78, 0x6D, 0x6C], // <?xml
        'image/bmp': [0x42, 0x4D]
    };

    for (const [mimeType, signature] of Object.entries(signatures)) {
        const matches = signature.every((byte, index) => buffer[index] === byte);
        if (matches) {
            return mimeType;
        }
    }

    return null;
};

// File filter - support all common image types
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg|bmp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|jpg|png|gif|webp|svg\+xml|bmp)/.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new AppError('Only image files are allowed (jpeg, jpg, png, gif, webp, svg, bmp)', HTTP_STATUS.BAD_REQUEST), false);
    }
};

// Create multer upload instance with memory storage for processing
const memoryStorage = multer.memoryStorage();

const upload = multer({
    storage: memoryStorage, // Use memory storage to process files
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
    },
    fileFilter: fileFilter
});

/**
 * Process and compress image
 */
const processImage = async (buffer, outputPath, options = {}) => {
    try {
        // Validate file type using magic bytes
        const detectedType = validateFileType(buffer);
        if (!detectedType) {
            throw new AppError('Invalid image file type', HTTP_STATUS.BAD_REQUEST);
        }

        // Process image with sharp
        let image = sharp(buffer);

        // Get image metadata
        const metadata = await image.metadata();

        // Resize if needed (max dimensions)
        const maxWidth = options.maxWidth || 2000;
        const maxHeight = options.maxHeight || 2000;

        if (metadata.width > maxWidth || metadata.height > maxHeight) {
            image = image.resize(maxWidth, maxHeight, {
                fit: 'inside',
                withoutEnlargement: true
            });
        }

        // Compress and convert to WebP if possible (better compression)
        const format = options.format || 'jpeg';
        const quality = options.quality || 85;

        if (format === 'webp' && detectedType !== 'image/svg+xml') {
            await image.webp({ quality }).toFile(outputPath);
        } else if (format === 'png' && detectedType === 'image/png') {
            await image.png({ quality: Math.floor(quality * 0.9) }).toFile(outputPath);
        } else {
            // Default to JPEG
            await image.jpeg({ quality, mozjpeg: true }).toFile(outputPath);
        }

        logger.info('Image processed successfully', { path: outputPath, format });
        return outputPath;
    } catch (error) {
        logger.error('Image processing failed', { error: error.message });
        throw error;
    }
};

/**
 * Middleware to process uploaded images
 */
const processUploadedImages = async (req, res, next) => {
    try {
        if (!req.files && !req.file) {
            return next();
        }

        const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];

        for (const file of files) {
            if (!file) continue;

            // Validate file type using magic bytes
            const detectedType = validateFileType(file.buffer);
            if (!detectedType) {
                return next(new AppError(`Invalid image file type: ${file.originalname}`, HTTP_STATUS.BAD_REQUEST));
            }

            // Determine output path
            let uploadPath = 'uploads/';
            if (file.fieldname === 'images' || file.fieldname === 'productImages' || file.fieldname === 'productImage') {
                uploadPath += 'products/';
            } else if (file.fieldname === 'bannerImage' || file.fieldname === 'bannerImages') {
                uploadPath += 'banners/';
            } else if (file.fieldname === 'proofImage' || file.fieldname === 'paymentProof') {
                uploadPath += 'payments/';
            } else if (file.fieldname === 'categoryImage' || file.fieldname === 'image') {
                uploadPath += 'categories/';
            }

            // Ensure directory exists
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            // Generate unique filename
            const uniqueName = generateUniqueFilename(file.originalname);
            const outputPath = path.join(uploadPath, uniqueName);

            // Process and save image
            await processImage(file.buffer, outputPath, {
                maxWidth: 2000,
                maxHeight: 2000,
                quality: 85,
                format: 'jpeg' // Convert all to JPEG for consistency (except SVGs)
            });

            // Update file path in request - ensure it's relative and uses forward slashes
            // We want 'uploads/products/filename.jpg'
            const relativePath = outputPath.replace(/\\/g, '/');
            file.path = relativePath.startsWith('./') ? relativePath.substring(2) : relativePath;
        }

        next();
    } catch (error) {
        next(error);
    }
};

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
    uploadFields,
    processUploadedImages,
    validateFileType
};
