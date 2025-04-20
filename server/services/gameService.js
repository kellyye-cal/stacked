const Friend = require('../models/friendModel');
const User = require('../models/userModel');
const Group = require('../models/groupModel');
const GroupActivity = require('../models/groupActivityModel');
const Member = require('../models/memberModel');
const Game = require('../models/gameModel');
const GameActivity = require('../models/gameActivity');

const {customAlphabet} = require('nanoid');
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const nanoid = customAlphabet(alphabet, 6);

const createGame = async({groupID, buyinPrice, chips, sessionName, invited, userID}) => {
    let gameID = nanoid();
    const earnings = {};
    const investment = {};
    invited.forEach((member) => {
        investment[member.userID] = parseFloat(buyinPrice) * -1;
        earnings[member.userID] = 0;
    })
    const newGame = new Game({
        gameID,
        groupID,
        investment,
        earnings,
        buyinPrice,
        chipValues: chips,
        sessionName
    });

    await newGame.save();

    const startGameLog = new GameActivity({
        gameID,
        groupID,
        userID,
        action: 'Game Start',
        data: {buyinPrice, chips, sessionName, invited}
    })

    await startGameLog.save();

    return gameID;
    
}

const getGame = async({groupID, gameID}) => {
    const queriedGame = await Game.findOne({
        gameID, groupID
    })

    return queriedGame;
}

const getGameActivity = async({groupID, gameID}) => {
    const activityLog = await GameActivity.find({groupID, gameID});

    return activityLog;
}

const getPlayerPics = async({gameID, groupID}) => {
    const queriedGame = await Game.findOne({gameID, groupID});
    const playerIDs = queriedGame.earnings.keys();

    const playerPics = {};
    
    for (const pID of playerIDs) {
        const foundUser = await User.findOne({userID: pID});

        const userInfo = {
            profilePic: foundUser.profilePic,
            displayName: foundUser.displayName
        }
        playerPics[pID] = userInfo;
    }

    return playerPics;
}

const buyIn = async({groupID, gameID, userID}) => {
    const queriedGame = await Game.findOne({groupID, gameID});
    if (queriedGame.status != 'Active') {throw new Error(`Game ${gameID} has already ended.`)}

    const currentInvestment = queriedGame.investment.get(userID);

    queriedGame.investment.set(userID, currentInvestment - queriedGame.buyinPrice);
    await queriedGame.save();

    const newLog = new GameActivity({
        gameID, 
        groupID,
        userID,
        action: 'Buy In'
    });

    await newLog.save();

    return;
}

const updateSettings = async({gameID, groupID, newGameName, newPlayers, userID}) => {
    const queriedGame = await Game.findOne({gameID, groupID});

    for (const uID of queriedGame.earnings.keys()) {
        if (!(uID in newPlayers)) {
            queriedGame.earnings.delete(uID);
            queriedGame.investment.delete(uID);
            let newGameLog = new GameActivity({
                gameID,
                groupID,
                userID,
                action: 'Remove Player',
                data: {removedPlayer: uID}
            });

            await newGameLog.save();
        }
    }

    for (const newPlayerID of Object.keys(newPlayers)) {
        if (!queriedGame.earnings.has(newPlayerID)) {
            queriedGame.investment.set(newPlayerID, queriedGame.buyinPrice * -1)
            queriedGame.earnings.set(newPlayerID, 0)

            let newGameLog = new GameActivity({
                userID,
                gameID,
                groupID,
                newPlayerID,
                action: 'Buy In',
            });

            await newGameLog.save()
        }
    }

    queriedGame.sessionName = newGameName;
    await queriedGame.save();

    return;
}

const updateAmounts = async({groupID, gameID, userID, newChips, newBuyInAmount}) => {
    const queriedGame = await Game.findOne({groupID, gameID});
    if (queriedGame.status != 'Active') {throw new Error(`Game ${gameID} has already ended.`)}

    let chipLog = new GameActivity({
        groupID,
        gameID,
        userID,
        action: 'Set Chip',
        data: {
            oldChips: queriedGame.chipValues,
            newChips
        }
    });

    await chipLog.save();
    
    queriedGame.chipValues = newChips;

    let buyInLog = new GameActivity({
        groupID,
        gameID,
        userID,
        action: 'Set Buy In',
        data: {
            oldBuyIn: queriedGame.buyinPrice,
            newBuyIn: newBuyInAmount
        }
    });

    await buyInLog.save();

    queriedGame.buyinPrice = parseFloat(newBuyInAmount);

    await queriedGame.save();

    console.log(queriedGame);

} 

const endGame = async({groupID, gameID, userID, earnings, chipQuantity}) => {
    const queriedGame = await Game.findOne({groupID, gameID});

    if (!queriedGame) {throw new Error(`No game exists for ${groupID} with ID ${gameID}.`)};
    if (queriedGame.status !== 'Active') {throw new Error(`Game ${gameID} has already ended.`)};
    
    queriedGame.earnings = earnings;
    queriedGame.status = 'End';

    await queriedGame.save();

    let netWinnings = {};

    for (const [player, playerInvestment] of queriedGame.investment.entries()) {
        netWinnings[player] = playerInvestment + earnings[player];
    }


    const gameEndLog = new GameActivity({
        gameID,
        groupID,
        userID,
        action: 'Game End',
        data: {earnings, chipQuantity, netWinnings}
    })

    await gameEndLog.save();

    return netWinnings;
}

module.exports = {
    createGame,
    getGame,
    getGameActivity,
    getPlayerPics,
    buyIn,
    updateSettings,
    updateAmounts,
    endGame
}