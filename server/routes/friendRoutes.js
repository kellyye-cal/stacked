const express = require('express')
const router = express.Router();
const friendController = require('../controllers/friendController')
const verifyJWT = require('../middleware/verifyJWT');

router.post('/add', verifyJWT, friendController.addFriend);
router.get('/get_friends/:userID', verifyJWT, friendController.getFriends);
router.get('/get_user/:userID', verifyJWT, friendController.getUserByID);
router.post('/respond', verifyJWT, friendController.respondToFriendRequest);
router.post('/create_group', verifyJWT, friendController.createGroup);
router.get('/my_groups/:userID', verifyJWT, friendController.getMyGroups);
router.get('/get_group_by_id/:groupID', verifyJWT, friendController.getGroupByID);

module.exports = router;