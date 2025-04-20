const express = require('express')
const router = express.Router();
const friendController = require('../controllers/friendController')
const verifyJWT = require('../middleware/verifyJWT');
const { verify } = require('jsonwebtoken');

router.post('/add', verifyJWT, friendController.addFriend);
router.get('/get_friends/:userID', verifyJWT, friendController.getFriends);
router.get('/get_user/:userID', verifyJWT, friendController.getUserByID);
router.post('/respond', verifyJWT, friendController.respondToFriendRequest);
router.post('/create_group', verifyJWT, friendController.createGroup);
router.get('/my_groups/:userID', verifyJWT, friendController.getMyGroups);
router.get('/my_group_invites/:userID', verifyJWT, friendController.getMyGroupInvites);
router.get('/get_group_by_id/:groupID', verifyJWT, friendController.getGroupByID);
router.post('/invite_to_group', verifyJWT, friendController.inviteFriendToGroup);
router.post('/respond_group', verifyJWT, friendController.respondToGroupInvite);
router.post('/request_join', verifyJWT, friendController.requestGroup)
router.post('/respond_join', verifyJWT, friendController.respondToJoinRequest);
router.get('/get_leaderboard/:groupID', verifyJWT, friendController.getLeaderboard);
router.post('/my_rank', verify, friendController.getMyRank)

module.exports = router;