const Friend = require('../models/friendModel');
const User = require('../models/userModel');

const addFriend = async({sender, recipient}) => {
    const user = await User.findOne({userID: recipient});

    if (!user) {return 404}

    const friendship = await Friend.findOne({userA: sender, userB: recipient});
    if (friendship) {return 422}

    const newFriendship = new Friend({
        userA: sender,
        userB: recipient,
        status: "Pending"
    })

    await newFriendship.save();
    return 204;
};

const getTopFriends = async({userID, limit}) => {
    const friends = await Friend.find({
        $or: [
            {userA: userID},
            {userB: userID}
        ]
    }).limit(parseInt(limit));

    return friends;
}

const getUserByID = async({userID}) => {
    const friend = await User.findOne({userID});
    return friend;
}

const acceptRequest = async({userA, userB}) => {
    await Friend.updateOne(
        {userA, userB},
        {$set: {
            status: "Accepted",
            friendsSince: new Date() 
        }}
    );
    return;
}

const rejectRequest = async({userA, userB}) => {
    await Friend.deleteOne({userA, userB});
    return; 
}

module.exports = {
    addFriend,
    getTopFriends,
    getUserByID,
    acceptRequest,
    rejectRequest
}