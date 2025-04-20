const authService = require('../services/authService');
const twilio = require('twilio');
const cloudinary = require('../utils/cloudinary');

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
console.log(process.env.TWILIO_VERIFY_SERVICE_SID);

const login = async(req, res) => {
    const phone = req.body.phoneNumber;

    try {
        if (process.env.NODE_ENV === "development" && phone.startsWith("202555")) {
            const user = await authService.findUserByPhone({phone});

            if (!user) {
                return res.status(200).json({next: "Register"});
            } else {
                const user = await authService.login({phoneNumber: phone});
                res.cookie('jwt', user.refreshToken, {httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000});
                return res.status(200).json({next: "LoginExisting", user})
            }
        }
        
        // const verification = await twilioClient.verify
        // .v2
        // .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        // .verifications
        // .create({to: `+1${phone}`, channel: "sms"});

        return res.status(200).json({next: "Verify"});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error logging in: ${err}`});
    }
}

const verifyCode = async(req, res) => {
    const {phone, code} = req.body;

    try {
        // FOR TESTING ONLY 
        const verificationCheck = {
            status: "approved"
        }


        // const verificationCheck = await twilioClient.verify
        // .v2
        // .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        // .verificationChecks
        // .create({to: `+1${phone}`, code});

        if (verificationCheck.status === 'approved') {
            const user = await authService.findUserByPhone({phone});

            if (!user) {
                return res.status(200).json({next: "Register"});
            } else {
                const user = await authService.login({phoneNumber: phone});
                res.cookie('jwt', user.refreshToken, {httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000});
                return res.status(200).json({next: "LoginExisting", user})
            }
        } else {
            res.status(200).json({next: "InvalidCode"});
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Verification failed"})
    }
}

const register = async(req, res) => {
    const {displayName, fName, lName, phoneNumber} = req.body;

    try {
        await authService.register({displayName, fName, lName, phoneNumber});
        const user = await authService.login({phoneNumber});

        res.cookie('jwt', user.refreshToken, {httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000});
        return res.status(200).json(user.user);
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error creating account for ${phoneNumber}: ${err}`})
    }
}

const logout = async(req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) { return res.status(204)}

    const {userID} = req.body
    res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true});

    try {
        await authService.removeToken({id: userID});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error logging out: ${err}`})
    }

    res.sendStatus(204)
}

const refresh = async(req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401);

    const refreshToken = cookies.jwt;

    try {
        const tokens = await authService.refreshAccessToken({refreshToken})
        console.log(tokens)
        if (tokens.refreshToken) {
            res.cookie('jwt', tokens.refreshToken, {httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000});
        }   

        return res.json({accessToken: tokens.accessToken})
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Error authenticating user", error})
    }
}

const updateProfilePicture = async(req, res) => {
    const {userID} = req.body;
    const file = req.file;

    try {
        const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;   
        const url = await authService.uploadProfilePicture({fileStr, userID});
        return res.status(200).json({url});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: `Error uploading profile picture: ${err}`})
    }
}

module.exports = {
    login,
    verifyCode,
    register,
    logout,
    refresh,
    updateProfilePicture
}