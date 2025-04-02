const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyJWT = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next(); // Skip JWT verification for OPTIONS requests
    }
    
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(' ')[1];
    
    jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        (err, decoded) => {
            if (err) return res.sendStatus(403); //invalid token
            req.id = decoded.id;
            next();
        }
    );
}

module.exports = verifyJWT;