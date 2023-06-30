const mongoose = require('mongoose');
const Tour = require('../models/tourModel');

const APIFeatures = require('../utils/apiFeatures');

// route heandle
exports.aliasTopTours = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,-price';
    req.query.fields =
        'name,price,ratingsAverage,summary,difficulty';
    next();
};
exports.getAllTours = async (req, res) => {
    try {
        const features = new APIFeatures(
            Tour.find(),
            req.query
        )
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
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: String(error),
        });
    }
};

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);

        res.json({
            status: 'success',
            data: {
                tour,
            },
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        });
    }
};

exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            tour: newTour,
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data',
        });
    }
};

exports.updateTour = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'succeess',
            data: null,
        });
    } catch (error) {
        res.status(404).json({
            status: 'fail',
            message: error,
        });
    }
};
