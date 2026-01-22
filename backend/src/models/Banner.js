const mongoose = require('mongoose');
const { BANNER_POSITIONS } = require('../utils/constants');

const bannerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Banner title is required'],
            trim: true
        },
        image: {
            type: String,
            required: [true, 'Banner image is required']
        },
        link: {
            type: String,
            trim: true,
            default: null
        },
        position: {
            type: String,
            enum: Object.values(BANNER_POSITIONS),
            default: BANNER_POSITIONS.HOMEPAGE
        },
        order: {
            type: Number,
            default: 0,
            min: 0
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

// Index for faster queries
bannerSchema.index({ position: 1, isActive: 1, order: 1 });

module.exports = mongoose.model('Banner', bannerSchema);
