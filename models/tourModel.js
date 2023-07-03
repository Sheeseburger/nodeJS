const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
        },
        slug: String,
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [
                true,
                'A tour must have a group size',
            ],
        },
        difficulty: {
            type: String,
            required: [
                true,
                'A tour must have a difficulty',
            ],
            trim: true,
        },
        ratingsAverage: { type: Number, default: 4.5 },
        ratingsQuantity: { type: Number, default: 0 },
        priceDiscount: {
            type: Number,
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a summary'],
        },
        description: {
            type: String,
            trim: true,
            required: [
                true,
                'A tour must have a description',
            ],
        },
        imageCover: {
            type: String,
            required: [
                true,
                'A tour must have a cover image',
            ],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
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

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// Document middleware

tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

// Query middleware
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });

    next();
});

// Aggregation middleware

tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({
        $match: {
            secretTour: { $ne: true },
        },
    });
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
