const express = require('express')
const router = express.Router();
const friendController = require('../controllers/friendController')
const verifyJWT = require('../middleware/verifyJWT');

router.post('/add', verifyJWT, friendController.addFriend);
router.get('/get_friends/:userID', verifyJWT, friendController.getFriends);
router.get('/get_user/:userID', verifyJWT, friendController.getUserByID);
router.post('/respond', verifyJWT, friendController.respondToFriendRequest);


module.exports = router;