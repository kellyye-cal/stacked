const express = require('express')
const router = express.Router();
const authController = require('../controllers/authController');
const verifyJWT = require('../middleware/verifyJWT');


router.post('/login', authController.login);
router.post('/verify', authController.verifyCode);
router.post('/register', authController.register);
router.post('/logout', verifyJWT, authController.logout);
router.post('/refresh', authController.refresh);


module.exports = router;