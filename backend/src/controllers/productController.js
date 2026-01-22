const Product = require('../models/Product');
const { AppError } = require('../middleware/errorMiddleware');
const { HTTP_STATUS } = require('../utils/constants');
const { getPagination, createPaginationMeta } = require('../utils/helpers');
const { getFilePath, getFilePaths } = require('../services/uploadService');

/**
 * @desc    Get all products with filtering, sorting, pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            type,
            platform,
            region,
            minPrice,
            maxPrice,
            search,
            sort = '-createdAt',
            active
        } = req.query;

        // Build query
        const query = {};
        if (active === 'true') query.isActive = true;
        if (category) query.category = category;
        if (type) query.type = type;
        if (platform) query.platform = platform;
        if (region) query.region = region;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        if (search) {
            query.$text = { $search: search };
        }

        // Pagination
        const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

        // Execute query
        const products = await Product.find(query)
            .populate('category', 'name')
            .sort(sort)
            .skip(skip)
            .limit(limitNum);

        const total = await Product.countDocuments(query);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                products,
                pagination: createPaginationMeta(total, pageNum, limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('category', 'name');

        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res, next) => {
    try {
        const productData = { ...req.body };

        // Handle file uploads
        if (req.files) {
            if (req.files.images) {
                productData.images = getFilePaths(req.files.images);
            }
            if (req.files.bannerImages) {
                productData.bannerImages = getFilePaths(req.files.bannerImages);
            }
        }

        const product = await Product.create(productData);
        await product.populate('category', 'name');

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Product created successfully',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        // Update fields
        Object.keys(req.body).forEach((key) => {
            if (req.body[key] !== undefined) {
                product[key] = req.body[key];
            }
        });

        // Handle file uploads
        if (req.files) {
            if (req.files.images) {
                product.images = [...product.images, ...getFilePaths(req.files.images)];
            }
            if (req.files.bannerImages) {
                product.bannerImages = [...product.bannerImages, ...getFilePaths(req.files.bannerImages)];
            }
        }

        await product.save();
        await product.populate('category', 'name');

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        await product.deleteOne();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle product status
 * @route   PATCH /api/products/:id/toggle
 * @access  Private/Admin
 */
const toggleProductStatus = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new AppError('Product not found', HTTP_STATUS.NOT_FOUND));
        }

        product.isActive = !product.isActive;
        await product.save();

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
            data: { product }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus
};
