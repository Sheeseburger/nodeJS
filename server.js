const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
    console.log(
        'unchaughtException!! Shutting down server...'
    );
    console.log(err.name, err.message);
    process.exit(1);
});

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
    console.log('DB connected!');
});
const app = require('./app');

// console.log(process.env);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
    console.log(
        'unhandledRejection!! Shutting down server...'
    );
    console.log(err.name, err.message);

    server.close(() => {
        process.exit(1);
    });
});
