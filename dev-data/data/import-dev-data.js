const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({
    path: `D:/course/4-natours/project/config.env`,
});
const mongoose = require('mongoose');

const Tour = require('../../models/tourModel');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
    console.log('DB connected!');
});
// read from file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

//import data to db

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data successfully loaded!');
        process.exit();
    } catch (error) {
        console.log(error);
    }
};

// Delete all data from DB

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('deleted!');
        process.exit();
    } catch (error) {
        console.log(error);
    }
};

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] == '--delete') {
    deleteData();
}
