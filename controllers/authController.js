const { promisify } = require('util');

const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

const AppError = require('../utils/appError');
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(
            new AppError(
                'Please provide email and/or password'
            ),
            400
        );
    }

    const user = await User.findOne({ email }).select(
        '+password'
    );

    if (
        !user ||
        !(await user.correctPassword(
            password,
            user.password
        ))
    ) {
        return next(
            new AppError('Incorrect email or password'),
            401
        );
    }

    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    // Get the token and check it
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        return next(
            new AppError(
                'You are not logged in bro :(',
                401
            )
        );
    }
    // Validate token
    const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
    );

    // check if user is still exist
    const freshUser = await User.findById(decoded.id);
    if (!freshUser)
        return next(
            new AppError('This user was deleted', 401)
        );
    // Check if user changed password after token was isued

    if (freshUser.changedPasswordAfter(decoded.iat))
        return next(
            new AppError(
                'User changed password. Please log in again.',
                401
            )
        );

    // Access to protected route
    req.user = freshUser;
    next();
});