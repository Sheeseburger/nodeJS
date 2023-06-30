const { default: mongoose, Query } = require('mongoose');
const Tour = require('../models/tourModel');

// const tours = JSON.parse(
//     fs.readFileSync(
//         `${__dirname}/../dev-data/data/tours-simple.json`
//     )
// );

// route heandle

exports.getAllTours = async (req, res) => {
    console.log(req.query);
    try {
        // Build query

        // Destructuring with ... => then to object, so it wont point to one object
        const queryObj = { ...req.query };
        const excludedFields = [
            'page',
            'sort',
            'limit',
            'fields',
        ];

        // Filtering
        excludedFields.forEach((el) => delete queryObj[el]);

        // Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => {
                return `$${match}`;
            }
        );
        let query = Tour.find(JSON.parse(queryStr));
        // sorting
        if (req.query.sort) {
            // replace for ading more than one option for sorting
            query.sort(req.query.sort.replaceAll(',', ' '));
        } else {
            query.sort('-createdAt');
        }
        if (req.query.fields) {
            query = query.select(
                req.query.fields.replaceAll(',', ' ')
            );
        } else {
            // minus means excluding
            // so it deleted __v from query
            query = query.select('-__v');
        }

        // Pagination
        const itemsPerPage = req.query.limit * 1 || 100;
        const page = req.query.page * 1 || 1;
        query = query
            .skip(itemsPerPage * (page - 1))
            .limit(itemsPerPage);
        if (req.query.page) {
            const toursAmount = await Tour.countDocuments();
            if (toursAmount <= itemsPerPage * (page - 1))
                throw new Error(
                    'This page doesn`t not exist'
                );
        }
        const tours = await query;
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
