const User = require('../models/userModel');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {customAlphabet} = require('nanoid');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const nanoid = customAlphabet(alphabet, 6);

const { cloudinary } = require('../utils/cloudinary');

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

    const {userID, phone, fName, lName, displayName, profilePic} = existingUser;

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

    return {user: {profilePic, accessToken, userID, phone, fName, lName, displayName}, refreshToken}
}

const removeToken = async({id}) => {
    await User.updateOne(
        {userID: id},
        {$unset: {refreshToken: ""}}
    )

    return;
}

const verifyToken = (token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded)
        })
    })
}

const refreshAccessToken = async({refreshToken}) => {
    const user = await User.findOne({ refreshToken });

    if (!user) throw new Error("Forbidden");

    let decoded;

    try {
     decoded = await verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new Error(error.message)
    }

    if (user.userID != decoded.userID) throw new Error("Forbidden");

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - now;
    const THRESHOLD = 60 * 60; 

    let newRefreshToken = null;

    if (timeLeft < THRESHOLD) {
        newRefreshToken = await generateRefreshToken({userID: decoded.userID});
        user.refreshToken = newRefreshToken;
        await user.save();
    }
    const accessToken = jwt.sign(
        {userID: decoded.userID},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: "1h"}
    );

    return {accessToken, refreshToken: newRefreshToken};
}

const generateRefreshToken = async({userID}) => {
    const refreshToken = jwt.sign(
        {userID},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: '7d'}
    );

    return refreshToken;
}

const uploadProfilePicture = async({fileStr, userID}) => {
    const user = await User.findOne({userID});

    if (user?.profilePicID) {
        try {
            await cloudinary.uploader.destroy(user.profilePicID)
        } catch (err) {
            throw new Error(err);
        }
    }

    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
        folder: "profile_pictures",
        transformation: [
            { width: 300, height: 300, crop: "fill", gravity: "auto" }
        ]
    });
    

    await User.updateOne(
        {userID},
        {$set: {
            profilePic: uploadResponse.secure_url,
            profilePicID: uploadResponse.public_id
        }}
    );

    return uploadResponse.secure_url;
}


module.exports = {
    findUserByPhone,
    register,
    login,
    removeToken,
    refreshAccessToken,
    generateRefreshToken,
    uploadProfilePicture
}