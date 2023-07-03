const mongoose = require('mongoose');
const slugify = require('slugify');

const validator = require('validator');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [
                40,
                'A tour name must have less or equal 40 characters',
            ],
            minlength: [
                10,
                'A tour name must have more or equal 10 characters',
            ],
            // validate: [
            //     validator.isAlpha,
            //     ' A tour must contain only charactercs',
            // ],
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
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message:
                    'Difficultly either: easy, medium, difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'A tour must be above 1.0'],
            max: [5, 'A tour must be below 5.0'],
        },
        ratingsQuantity: { type: Number, default: 0 },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // this works only with new documents, NOT UPDATE!!!
                    return val < this.price;
                },
                message:
                    'Discount price ({VALUE}) should be below regular price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a summary'],
        },
        description: {
            type: String,
            trim: true,
            // required: [
            //     true,
            //     'A tour must have a description',
            // ],
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
