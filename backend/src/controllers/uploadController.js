const { HTTP_STATUS } = require('../utils/constants');

/**
 * @desc    Upload file
 * @route   POST /api/upload
 * @access  Private
 */
const uploadFile = (req, res, next) => {
    if (!req.file) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'No file uploaded'
        });
    }

    res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
            url: req.file.path,
            filename: req.file.filename
        }
    });
};

module.exports = {
    uploadFile
};
