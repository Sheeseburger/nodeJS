const mongoose = require('mongoose');

const User = require('./userModel');
const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'A review must have a text'],
        },

        rating: {
            type: Number,
            default: 5,
            min: [1, 'A rate must be above 1.0'],
            max: [5, 'A rate must be below 5.0'],
        },

        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },

        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a tour'],
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a user'],
        },
    },

    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo',
    }).populate({ path: 'tour', select: 'name' });
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
