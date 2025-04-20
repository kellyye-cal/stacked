const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: {
        type: String,
        unique: true,
        required: true
    },
    phone: {
        type: String,
        unique: true,
        required: true
    },
    fName: {
        type: String,
        required: true
    },
    lName: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
    }, profilePic: {
        type: String,
        default: ''
    },  profilePicID: {
        type: String,
        default: ''
    },
    refreshToken: {
        type: String
    },

})

const User = mongoose.model('User', userSchema);
module.exports = User;