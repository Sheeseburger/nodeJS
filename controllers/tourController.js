const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// route heandle
exports.aliasTopTours = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,-price';
    req.query.fields =
        'name,price,ratingsAverage,summary,difficulty';
    next();
};
exports.getAllTours = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const tours = await features.query;
    res.json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours,
        },
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
        next(
            new AppError(
                `No tour find with id ${req.params.id}`,
                404
            )
        );
        return;
    }
    res.json({
        status: 'success',
        data: {
            tour,
        },
    });
});

exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: 'success',
        tour: newTour,
    });
});

exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        status: 'succeess',
        data: { tour },
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(
        req.params.id
    );

    if (!tour) {
        next(
            new AppError(
                `No tour find with id ${req.params.id}`,
                404
            )
        );
    }

    res.status(204).json({
        status: 'succeess',
        data: null,
    });
});

exports.getTourStats = catchAsync(
    async (req, res, next) => {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } },
            },
            {
                $group: {
                    // _id: '$ratingsAverage',
                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 },
                    numRatings: {
                        $sum: '$ratingsQuantity',
                    },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                },
            },
            {
                $sort: {
                    avgPrice: 1,
                },
            },
            // {
            //     $match: { _id: { $ne: 'EASY' } },
            // },
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                stats,
            },
        });
    }
);

exports.getMonthlyPlan = catchAsync(
    async (req, res, next) => {
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates',
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(req.params.year),
                        $lte: new Date(
                            `${req.params.year}-12-31`
                        ),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: '$name' },
                },
            },
            {
                $addFields: {
                    month: '$_id',
                },
            },
            { $project: { _id: 0 } },
            { $sort: { numTourStarts: -1 } },
            // { $limit: 6 },
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                plan,
            },
        });
    }
);
