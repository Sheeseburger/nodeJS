const mongoose = require('mongoose');

const validator = require('validator');

const bcrypt = require('bcryptjs');

//name, email, photo, password, passwordConfirm

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'We need your name :3'],
    },
    email: {
        type: String,
        required: [true, 'We need your email ;3'],
        unique: true,
        lowercase: true,
        validate: [
            validator.isEmail,
            'Email is not correct',
        ],
    },
    photo: {
        type: String,
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Wrong password'],
        minlength: 8,

        // Work only with SAVE !
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same :(',
        },
    },
    passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
    //only run if password was modified

    if (!this.isModified('password')) return next();
    // hash the password
    this.password = await bcrypt.hash(this.password, 13);
    this.passwordConfirm = undefined;

    next();
});

userSchema.methods.correctPassword = async function (
    passwordForCheck,
    userPassword
) {
    return await bcrypt.compare(
        passwordForCheck,
        userPassword
    );
};

// false means not changed, true - changed password
userSchema.methods.changedPasswordAfter = function (
    JWTTimestamp
) {
    if (this.passwordChangedAt) {
        return (
            parseInt(
                this.passwordChangedAt.getTime() / 1000,
                10
            ) < JWTTimestamp
        );
    }
    return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
