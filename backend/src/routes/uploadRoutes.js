const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle, processUploadedImages } = require('../middleware/uploadMiddleware');

// @route   POST /api/upload
// @access  Private
router.post(
    '/',
    protect,
    uploadSingle('file'), // Expects form field 'file'
    processUploadedImages,
    uploadFile
);

module.exports = router;
