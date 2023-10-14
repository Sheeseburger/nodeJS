const crypto = require('crypto');

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
        validate: [validator.isEmail, 'Email is not correct'],
    },
    photo: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user',
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
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});
userSchema.pre('save', async function (next) {
    //only run if password was modified

    if (!this.isModified('password')) return next();
    // hash the password
    this.password = await bcrypt.hash(this.password, 13);
    this.passwordConfirm = undefined;

    next();
});

userSchema.pre(/^find/, async function (next) {
    // this points to current query
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function (
    passwordForCheck,
    userPassword
) {
    return await bcrypt.compare(passwordForCheck, userPassword);
};

// false means not changed, true - changed password
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        return (
            parseInt(this.passwordChangedAt.getTime() / 1000, 10) < JWTTimestamp
        );
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    console.log({ resetToken }, this.passwordResetToken);

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
