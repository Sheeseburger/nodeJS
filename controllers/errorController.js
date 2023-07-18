const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // It's fine, leak it
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    // Programming errors: Don't leak it
    else {
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong',
        });
    }
};

const handleCastErrorDB = (err) => {
    return new AppError(
        `Invalid ${err.path}: ${err.value}.`,
        400
    );
};

const handleDuplicateFieldsDB = (err) => {
    return new AppError(
        `Duplicate field value: ${err.keyValue.name}. Please use another name <3`,
        400
    );
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(
        (element) => element.message
    );
    return new AppError(
        `Validation error: ${errors.join('. ')}.`,
        400
    );
};

const handleJWTError = () =>
    new AppError('Invalid token. Please login again', 401);

const handleJWTErrorExpired = () =>
    new AppError(
        'You token has expired. Please log in again.',
        401
    );

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = err;
        if (error.name === 'CastError')
            // wrong id for mongodb
            error = handleCastErrorDB(error);
        else if (error.code === 11000)
            // duplicate name error
            error = handleDuplicateFieldsDB(error);
        else if (error.name === 'ValidationError')
            error = handleValidationErrorDB(error);
        else if (error.name === 'JsonWebTokenError')
            error = handleJWTError();
        else if (error.name === 'TokenExpiredError')
            error = handleJWTErrorExpired();

        sendErrorProd(error, res);
    }
};
