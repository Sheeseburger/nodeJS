const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandle = require('./controllers/errorController');

// GLOBAL Middleweare

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
const limiter = rateLimit({
    max: 10,
    windowMs: 60 * 1000,
    message: 'Too many requests from this IP, please try again later',
});
app.use(express.json());
app.use('/api', limiter);
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server :#`, 404));
});

app.use(globalErrorHandle);

module.exports = app;
