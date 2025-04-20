const Friend = require('../models/friendModel');
const User = require('../models/userModel');
const Group = require('../models/groupModel');
const GroupActivity = require('../models/groupActivityModel');
const Member = require('../models/memberModel');
const Game = require('../models/gameModel')

const {customAlphabet} = require('nanoid');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const nanoid = customAlphabet(alphabet, 4);

const addFriend = async({sender, recipient}) => {
    const user = await User.findOne({userID: recipient});

    if (!user) {return 404}

    const existingFriendship = await Friend.findOne({
        $or: [
            { userA: sender, userB: recipient },
            { userA: recipient, userB: sender }
        ]
    });
    
    if (existingFriendship) {
        return 422;
    }

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

    const myGroups = ((await getMyGroups({userID})).map(group => group.groupID));
    
    const friendsWithMutuals = await Promise.all(friends.map(async (friendship) => {
        let friendID = friendship.userA === userID ? friendship.userB : friendship.userA;
        const groups = await getMyGroups({ userID: friendID });

        const mutualGroups = groups
            .filter(group => myGroups.includes(group.groupID))
            .map(group => group.name);

        const friendObj = friendship.toObject();
        friendObj.mutualGroups = mutualGroups;

        return friendObj;
    }));

    return friendsWithMutuals;
}

const getUserByID = async({userID}) => {
    const {friendID, phone, fName, lName, displayName, profilePic} = await User.findOne({userID});

    const friend = {
        userID: friendID,
        phone, 
        fName, 
        lName, 
        displayName, 
        profilePic
    }

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

    const groupMembers = await Promise.all(
        groups.map(async (group) => ({
            groupID: group.groupID,
            name: group.name,
            members: await getMembersOfGroup({groupID: group.groupID})
    }))
);

    return groupMembers;
}

const getMyGroupInvites = async({userID}) => {
    const groupIDs = await Member.find({
        $and: [
            {userID},
            {role: "Invited"}
        ]
    })

    const invites = []

    for (const group of groupIDs) {
        const groupDetails = await Group.findOne({ groupID: group.groupID });

        const invitedBy = await GroupActivity.findOne({
            groupID: group.groupID,
            action: "Invite",
            data: {invitedUser: userID}
        })

        const invitedByUser = await User.findOne({userID: invitedBy.userID})

        const inviteDetails = {
            groupID: groupDetails.groupID,
            name: groupDetails.name,
            invitedBy: invitedByUser.displayName,
            invitedByPic: invitedByUser.profilePic
        }

        invites.push(inviteDetails);
    }

    return invites;
}

const getMembersOfGroup = async({groupID}) => {
    const membersOfGroup = await Member.find({groupID});
    
    const memberIDs = membersOfGroup.map(member => member.userID);

    const users = await User.find(
        {userID: {$in: memberIDs}},
        {userID: 1, displayName: 1, profilePic: 1}
    );

    const statusMap = {};
    membersOfGroup.forEach(member => {
        statusMap[member.userID] = member.role;
    });

    const members = users.map(user => ({
        userID: user.userID,
        displayName: user.displayName,
        profilePic: user.profilePic,
        role: statusMap[user.userID] || null
    }));
    
    return members;
}

const getGroupByID = async({groupID}) => {
    const groupData = await Group.findOne({groupID});
    const members = await getMembersOfGroup({groupID});
    const games = await Game.find({groupID})

    return {groupData, members, games}
}

const inviteFriendToGroup = async ({groupID, invitingUser, invitedUser}) => {
    const existingUser = await User.findOne({userID: invitedUser});
    if (!existingUser) {return 404}

    // Member.deleteMany({userID: "BTYAK8"});
    // GroupActivity.deleteMany({action: "Invite"})

    const existingMember = await Member.findOne({userID: invitedUser});
    if (existingMember) {return 422}
    const newActivity = new GroupActivity({
        groupID,
        userID: invitingUser,
        action: 'Invite',
        data: {invitedUser}
    });

    await newActivity.save();

    const newMember = new Member({
        userID: invitedUser,
        groupID,
        role: "Invited"
    })

    newMember.save();

    return 204;
}

const acceptGroupInvite = async({userID, groupID}) => {
    const invite = await Member.findOne({userID, groupID});

    if (!invite) {return "No invite found."}

    if (invite.role === "Requested") {
        return "No invite found"
    } else if (invite.role === "Member") {
        return "Already a member"
    } else if (invite.role === "Invited") {
        await Member.updateOne(
            {userID, groupID},
            {$set: {role: "Member"}}
        );

        const newLog = new GroupActivity({
            groupID,
            userID,
            action: 'Join',
        })

        await newLog.save();

        return "Success"
    }
}

const rejectGroupInvite = async({userID, groupID}) => {
    const invite = await Member.findOne({userID, groupID});

    if (!invite) {return "No invite found."}

    if (invite.role === "Requested") {
        return "No invite found"
    } else if (invite.role === "Member") {
        return "Already a member."
    } else if (invite.role === "Invited") {
        await Member.deleteOne({userID, groupID});
        const allMembers = await Member.find({});
        
        return "Success"
    }

}

const requestGroup = async({userID, groupID}) => {
    const group = await Group.findOne({groupID});

    if (!group) {return "No group found with that code."}

    const existingInvite = await Member.findOne({userID, groupID});

    if (!existingInvite) {
        const newMembership = new Member({
            userID,
            groupID,
            role: 'Requested'
        });

        await newMembership.save();

        const newLog = new GroupActivity({
            groupID,
            userID,
            action: 'Request'
        });

        await newLog.save();

        return "Success"
    } else if (existingInvite.role === 'Member') {
        return "You are already a member of this group."
    } else if (existingInvite.role === "Requested") {
        return "You have already requested this group."
    } else if (existingInvite.role === "Invited") {
        const response = await acceptGroupInvite({userID, groupID});
        return response;
    }
    return "Success"
}

const acceptJoinRequest = async({userID, groupID, memberID}) => {
    const member = await Member.findOne({userID: memberID, groupID});

    if (!member || member.role !== 'Member') {
        return "You are not authorized to accept this request."
    }

    const request = await Member.findOne({userID, groupID});
    if (request.role === 'Member') {
        return `${userID} is already a member of this group.`
    } else if (request.role === 'Requested') {
        await Member.updateOne(
            {userID, groupID},
            {$set: {role: 'Member'}}
        );

        const newLog = new GroupActivity({
            groupID,
            userID,
            action: 'Join',
            data: {AcceptedBy: memberID}
        });

        await newLog.save();

        return "Success"
    }
    return "Error"
}

const rejectJoinRequest = async({userID, groupID, memberID}) => {
    const member = await Member.findOne({userID: memberID, groupID});

    if (!member || member.role !== 'Member') {
        return "You are not authorized to reject this request."
    }

    const request = await Member.findOne({userID, groupID});
    if (request.role === 'Member') {
        return `${userID} is already a member of this group.`
    } else if (request.role === 'Requested') {
        await Member.deleteOne(
            {userID, groupID}
        );

        const newLog = new GroupActivity({
            groupID,
            userID,
            action: 'Join',
            data: {RejectedBy: memberID}
        });

        await newLog.save();

        return "Success"
    }
    return "Error"
}

const getLeaderboard = async({groupID}) => {
    const allGames = await Game.find({groupID});
    const members = await getMembersOfGroup({groupID});

    const leaderboard = {}

    members.forEach((member) => {
        if (member.role === 'Member') {
            leaderboard[member.userID] = {
                userID: member.userID,
                displayName: member.displayName,
                profilePic: member.profilePic,
                netInvestment: 0,
                netEarnings: 0,
                biggestLoss: 0, 
                gamesPlayed: 0,
            };
        }
    });

    allGames.forEach((game) => {
        for (const [playerID, investment] of game.investment.entries()) {
            if (game.status === 'End') {
                let winningsForThisGame = game.earnings.get(playerID) + investment;

                leaderboard[playerID].netInvestment += investment;
                leaderboard[playerID].netEarnings += winningsForThisGame;
    
                leaderboard[playerID].biggestLoss = Math.min(leaderboard[playerID].biggestLoss, winningsForThisGame)
                leaderboard[playerID].gamesPlayed += 1;
            }
    }})

    return leaderboard;
}

const getMyRank = async({groupID, userID}) => {
    const groupLeaderboard = await getLeaderboard({groupID});

    const sortedLeaderboard = (Object.values(groupLeaderboard).sort((a, b) => b.netEarnings - a.netEarnings));

    const rank = sortedLeaderboard.findIndex(player => player.userID === userID) + 1

    const netEarnings = groupLeaderboard[userID].netEarnings;

    return {rank, netEarnings};
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
    getGroupByID,
    inviteFriendToGroup,
    getMyGroupInvites,
    acceptGroupInvite,
    rejectGroupInvite,
    requestGroup,
    acceptJoinRequest,
    rejectJoinRequest,
    getLeaderboard,
    getMyRank
}