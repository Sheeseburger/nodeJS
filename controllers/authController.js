const { promisify } = require('util');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

const sendEmail = require('../utils/email');
const AppError = require('../utils/appError');
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statucCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),

        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);
    //remove password from oputput
    user.password = undefined;
    res.status(statucCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role,
    });
    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Please provide email and/or password'), 400);
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password'), 401);
    }
    createSendToken(user, 200, res);
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
        return next(new AppError('You are not logged in bro :(', 401));
    }
    // Validate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // check if user is still exist
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) return next(new AppError('This user was deleted', 401));
    // Check if user changed password after token was isued
    if (freshUser.changedPasswordAfter(decoded.iat))
        return next(
            new AppError('User changed password. Please log in again.', 401)
        );

    // Access to protected route
    req.user = freshUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You dont have permision :(', 403));
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //get user based on posted email
    const user = await User.findOne({
        email: req.body.email,
    });
    if (!user)
        return next(new AppError('There is no user with this email', 404));
    // generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    //send email

    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot password? Submit a patch request with youer new password and password confirm to: ${resetURL}`; // !!! WRITE SOMETHING MORE COOL
    try {
        await sendEmail({
            email: user.email,
            subject: 'Reset token (10 minutes)',
            message,
        });
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        next(
            new AppError(
                'There was an error with sending the mail. Try again later',
                500
            )
        );
    }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
    // get user based on token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt: Date.now(),
        },
    });
    if (!user) {
        next(new AppError('Token is invalid or has expired'), 400);
    }
    // if token !expired, and is user, set new password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    // update changedPasswordAt
    createSendToken(user, 201, res);

    // const token = signToken(user._id);

    // res.status(201).json({
    //     status: 'success',
    //     token,
    // });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    // get user
    const user = await User.findById(req.user._id).select('+password');
    // check if prev password is correct
    if (
        !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
        return next(new AppError('Current password is wrong', 401));
    }
    // update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // log user in, send JWT
    createSendToken(user, 201, res);
});
