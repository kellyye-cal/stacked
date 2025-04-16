const Friend = require('../models/friendModel');
const User = require('../models/userModel');
const Group = require('../models/groupModel');
const GroupActivity = require('../models/groupActivityModel');
const Member = require('../models/memberModel');

const {customAlphabet} = require('nanoid');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const nanoid = customAlphabet(alphabet, 4);

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

const createGroup = async({user, groupName}) => {
    const groupID = nanoid();

    const newGroup = new Group({
        groupID,
        name: groupName,
        createdBy: user
    });

    await newGroup.save();

    const newActivity = new GroupActivity({
        groupID,
        userID: user,
        action: 'Create Group'
    });

    await newActivity.save();
    
    const newMember = new Member({
        userID: user,
        groupID,
        role: "Member"
    })
    
    await newMember.save();

    return;
}

const getMyGroups = async({userID}) => {
    const memberOf = await Member.find({
        $and: [
            {userID},
            {role: "Member"}
        ]
    });

    const groupIDs = [];

    for (let i = 0; i < memberOf.length; i++) {
        groupIDs.push(memberOf[i].groupID)
    }

    const groups = await Group.find({groupID: {$in: groupIDs}});

    return groups;
}

const getMembersOfGroup = async({groupID}) => {
    const membersOfGroup = await Member.find({groupID});
    
    const memberIDs = []

    for (let i = 0; i < membersOfGroup.length; i++) {
        memberIDs.push(membersOfGroup[i].userID);
    }

    const members = await User.find(
        {userID: {$in: memberIDs}},
        {userID: 1, displayName: 1, profilePic: 1}
    );
    
    return members;
}

const getGroupByID = async({groupID}) => {
    const groupData = await Group.findOne({groupID});
    const members = await getMembersOfGroup({groupID});

    return {groupData, members}
}

module.exports = {
    addFriend,
    getTopFriends,
    getUserByID,
    acceptRequest,
    rejectRequest,
    createGroup,
    getMyGroups,
    getMembersOfGroup,
    getGroupByID
}