const mongoose = require('mongoose');
const { PRODUCT_TYPES, PLATFORMS, REGIONS } = require('../utils/constants');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Product description is required'],
            trim: true
        },
        price: {
            type: Number,
            required: [true, 'Product price is required'],
            min: [0, 'Price cannot be negative']
        },
        discountPrice: {
            type: Number,
            min: [0, 'Discount price cannot be negative'],
            default: null,
            validate: {
                validator: function (value) {
                    return value === null || value < this.price;
                },
                message: 'Discount price must be less than regular price'
            }
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Product category is required']
        },
        type: {
            type: String,
            enum: Object.values(PRODUCT_TYPES),
            required: [true, 'Product type is required']
        },
        region: {
            type: String,
            enum: Object.values(REGIONS),
            default: REGIONS.GLOBAL
        },
        platform: {
            type: String,
            enum: Object.values(PLATFORMS),
            default: PLATFORMS.PC
        },
        stock: {
            type: Number,
            required: [true, 'Stock quantity is required'],
            min: [0, 'Stock cannot be negative'],
            default: 0
        },
        images: {
            type: [String],
            default: []
        },
        bannerImages: {
            type: [String],
            default: []
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

// Indexes for filtering and searching
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ type: 1, isActive: 1 });
productSchema.index({ platform: 1, isActive: 1 });
productSchema.index({ region: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Virtual for effective price (considering discount)
productSchema.virtual('effectivePrice').get(function () {
    return this.discountPrice || this.price;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
    if (this.discountPrice && this.discountPrice < this.price) {
        return Math.round(((this.price - this.discountPrice) / this.price) * 100);
    }
    return 0;
});

// Include virtuals in JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
