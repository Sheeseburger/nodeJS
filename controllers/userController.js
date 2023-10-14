const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.GetAllUsers = async (req, res) => {
    const users = await User.find();
    res.json({
        status: 'success',
        results: users.length,
        data: {
            users: users,
        },
    });
};

const filterObj = (obj, ...alowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (alowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};

// user updates be himself
exports.updateMe = catchAsync(async (req, res, next) => {
    // check if not updating password

    if (req.body.password || req.body.confirmPassword)
        return next(new AppError('This route is not for password updating'), 400);

    // filter only allowed fields
    const filteredBody = filterObj(req.body, 'name', 'email');
    // update user data

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined yet',
    });
};
exports.getUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined yet',
    });
};
exports.updateUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined yet',
    });
};
exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined yet',
    });
};
