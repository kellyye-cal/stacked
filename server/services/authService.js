const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {customAlphabet} = require('nanoid');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const nanoid = customAlphabet(alphabet, 6);

const findUserByPhone = async({phone}) => {
    const user = await User.findOne({phone});

    return user;
}

const register = async({displayName, fName, lName, pwd, phoneNumber}) => {
    const existingUser = await User.findOne({ phone: phoneNumber });

    // if (existingUser) {throw new Error("User already exists with this phone number.");}
    if (existingUser) {await User.deleteOne({phone: phoneNumber})}

    // const hashedPwd = await bcrypt.hash(pwd, 10);

    const newUser = new User({
        userID: nanoid(),
        phone: phoneNumber,
        // pwd: hashedPwd,
        fName,
        lName,
        displayName,
    })

    await newUser.save();
    return;
}

const login = async({phoneNumber}) => {
    const existingUser = await User.findOne({ phone: phoneNumber });
    if (!existingUser) throw new Error("No user exists with this phone number.");

    const {userID, phone, fName, lName, displayName} = existingUser;

    // var match = await bcrypt.compare(pwd, existingUser.pwd);

    // if (match) {
    const accessToken = jwt.sign(
        {"userID": userID},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '1h'}
    );

    const refreshToken = jwt.sign(
        {"userID": userID},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '7d'}
    );

    await User.updateOne(
        {userID: existingUser.userID},
        {$set: {refreshToken: refreshToken}}
    );

    return {user: {accessToken, userID, phone, fName, lName, displayName}, refreshToken}
}

const removeToken = async({id}) => {
    await User.updateOne(
        {userID: id},
        {$unset: {refreshToken: ""}}
    )

    return;
}

module.exports = {
    findUserByPhone,
    register,
    login,
    removeToken
}