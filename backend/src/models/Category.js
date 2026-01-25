const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            unique: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        image: {
            type: String,
            default: null
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

// Indexes for faster queries
categorySchema.index({ isActive: 1 });
categorySchema.index({ name: 1 }); // Already unique, but explicit index
categorySchema.index({ createdAt: -1 }); // For sorting by creation date

module.exports = mongoose.model('Category', categorySchema);
