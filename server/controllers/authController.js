const authService = require('../services/authService');
const twilio = require('twilio');

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
console.log(process.env.TWILIO_VERIFY_SERVICE_SID);

const login = async(req, res) => {
    const phone = req.body.phoneNumber;
    try {
        
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
        const accessToken = await authService.refreshAccessToken({refreshToken})
        console.log(accessToken)
        return res.json({accessToken})
    } catch (error) {
        res.status(500).json({message: "Error authenticating user", error})
    }

}

module.exports = {
    login,
    verifyCode,
    register,
    logout,
    refresh
}