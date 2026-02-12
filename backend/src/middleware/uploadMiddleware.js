const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/';

        // Determine subfolder based on route or field name
        if (req.baseUrl.includes('products')) {
            uploadPath += 'products/';
        } else if (req.baseUrl.includes('users')) {
            uploadPath += 'users/';
        } else {
            uploadPath += 'others/';
        }

        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Initialize multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB limit
    }
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
    return (req, res, next) => {
        const uploadMiddleware = upload.single(fieldName);
        uploadMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: `Upload error: ${err.message}` });
            } else if (err) {
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    };
};

// Middleware to process uploaded images (resize, format)
const processUploadedImages = async (req, res, next) => {
    if (!req.files && !req.file) return next();

    req.uploadedImages = {};

    if (req.files) {
        Object.keys(req.files).forEach(key => {
            req.uploadedImages[key] = req.files[key].map(file => file.path.replace(/\\/g, '/'));
        });
    } else if (req.file) {
        // If single file upload, usually looking for specific field handling
        req.uploadedImages[req.file.fieldname] = req.file.path.replace(/\\/g, '/');
    }

    next();
};

// Middleware for multiple fields upload
const uploadFields = (fields) => {
    return (req, res, next) => {
        const uploadMiddleware = upload.fields(fields);
        uploadMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                console.error('Multer Error (Fields):', err);
                return res.status(400).json({ message: `Upload error: ${err.message}` });
            } else if (err) {
                console.error('Upload Error (Fields):', err);
                return res.status(400).json({ message: err.message });
            }
            next();
        });
    };
};

module.exports = {
    uploadSingle,
    uploadFields,
    processUploadedImages
};
