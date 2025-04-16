
const friendService = require('../services/friendService');

const addFriend = async(req, res) => {
    const {sender, friendCode} = req.body;
    
    if (sender === friendCode) {
        return res.status(200).json({status: 422});
    }

    try {
        const status = await friendService.addFriend({sender, recipient: friendCode});
        return res.status(200).json({status});
    } catch (err) {
        console.error(err)
        return res.status(500).json({message: `Error adding friend: ${err}`})
    }
}

const getFriends = async(req, res) => {
    const {userID} = req.params;
    const {limit} = req.query;

    try {
        if (limit) {
            const friends = await friendService.getTopFriends({userID, limit});
            return res.status(200).json(friends);
        } else {
            //return for now
            return
        }
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error getting friends: ${err}`});
    }
}

const getUserByID = async(req, res) => {
    const {userID} = req.params;
    
    try {
        const friend = await friendService.getUserByID({userID});
        return res.status(200).json({friend})
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error getting user by ID: ${err}`})
    }
}

const respondToFriendRequest = async(req, res) => {
    const {response, userA, userB} = req.body;
    try {
        if (response === "Accept") {
            await friendService.acceptRequest({userA, userB})
        } else if (response === "Reject") {
            await friendService.rejectRequest({userA, userB});
        }
        return res.status(204)
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error responding to friend request: ${err}`})
    }
}

const createGroup = async(req, res) => {
    const {user, groupName} = req.body;

    try {
        await friendService.createGroup({user, groupName});
        return res.status(204).send();
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error creating group: ${err}`})
    }
}

const getMyGroups = async(req, res) => {
    const {userID} = req.params;

    try {
        const groups = await friendService.getMyGroups({userID});
        return res.status(200).json({groups});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error getting groups: ${err}`})
    }
}

const getGroupByID = async(req, res) => {
    const {groupID} = req.params;
    
    try {
        const {groupData, members} = await friendService.getGroupByID({groupID});
        return res.status(200).json({members, groupData});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error getting group: ${err}`})
    }

}

module.exports = {
    addFriend,
    getFriends,
    getUserByID,
    respondToFriendRequest,
    createGroup,
    getMyGroups,
    getGroupByID
}