const Tour = require('../models/tourModel');

// const tours = JSON.parse(
//     fs.readFileSync(
//         `${__dirname}/../dev-data/data/tours-simple.json`
//     )
// );

exports.checkBody = (req, res, next) => {
    if (!req.body.price || !req.body.name) {
        return res.status(400).json({
            status: 'fail',
            message: 'Miss price or name',
        });
    }
    next();
};

// route heandle

exports.getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.json({
        status: 'success',
        // results: tours.length,
        // requestedAt: req.requestTime,
        // data: {
        //     tours: tours,
        // },
    });
};

exports.getTour = (req, res) => {
    // const tour = tours.find(
    //     (el) => el.id === req.params.id * 1
    // );
    // if (tour) {
    res.json({
        status: 'success',
        //         data: {
        //             tour,
        //         },
    });
    // }
};

exports.createTour = (req, res) => {
    res.status(201).json({
        status: 'success',
    });
};

exports.updateTour = (req, res) => {
    res.status(200).json({
        status: 'succeess',
        data: 'Updated tour',
    });
};

exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: 'succeess',
        data: null,
    });
};
