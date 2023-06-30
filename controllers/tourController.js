const fs = require('fs');

exports.checkID = (req, res, next, val) => {
    if (req.params.id * 1 > tours.length) {
        return res.status(404).json({
            status: 'fail',
            message: 'invalid ID',
        });
    }
    next();
};

exports.checkBody = (req, res, next) => {
    if (!req.body.price || !req.body.name) {
        return res.status(400).json({
            status: 'fail',
            message: 'Miss price or name',
        });
    }
    next();
};

const tours = JSON.parse(
    fs.readFileSync(
        `${__dirname}/../dev-data/data/tours-simple.json`
    )
);

// route heandle

exports.getAllTours = (req, res) => {
    console.log(req.requestTime);
    res.json({
        status: 'success',
        results: tours.length,
        requestedAt: req.requestTime,
        data: {
            tours: tours,
        },
    });
};

exports.getTour = (req, res) => {
    console.log(req.params);
    const id = req.params.id * 1;
    const tour = tours.find((el) => el.id === id);
    if (tour) {
        res.json({
            status: 'success',
            data: {
                tour,
            },
        });
    } else {
    }
};

exports.createTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
    tours.push(newTour);

    fs.writeFile(
        `${__dirname}/../dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err) => {
            if (err) console.log('error:(');
            res.status(201).json({
                status: 'success',
                data: {
                    tour: newTour,
                },
            });
        }
    );
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
