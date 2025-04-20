const gameService = require('../services/gameService');

const createGame = async(req, res) => {
    console.log(req.body);
    const {groupID, buyinPrice, chips, sessionName, invited, userID} = req.body;

    try {
        const gameID = await gameService.createGame({groupID, buyinPrice, chips, sessionName, invited, userID});
        return res.status(200).send({gameID})
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error creating game: ${err}`})
    }
}

const getGame = async(req, res) => {
    const {gameID, groupID} = req.body;
    
    try {
        const game = await gameService.getGame({gameID, groupID});
        const activityLog = await gameService.getGameActivity({gameID, groupID});
        const players = await gameService.getPlayerPics({gameID, groupID})
        return res.status(200).json({game, activityLog, players})
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error getting game: ${err}`})
    }
}

const getPlayerPics = async(req, res) => {
    const {gameID, groupID} = req.body;
    console.log(req.body)

    try {
        const playerPics = await gameService.getPlayerPics({gameID, groupID});
        return res.status(200).json({playerPics});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error getting player pics: ${err}`})
    }
}

const buyIn = async(req, res) => {
    const {groupID, gameID, userID} = req.body;

    try {
        await gameService.buyIn({groupID, gameID, userID});
        return res.status(204).send();
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error buying in : ${err}`})
    }
}

const updateSettings = async(req, res) => {
    const {gameID, groupID, newGameName, newPlayers, userID} = req.body;
    try {
        await gameService.updateSettings({gameID, groupID, newGameName, newPlayers, userID});
        return res.status(204).send();

    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error updating game settings : ${err}`})
    }
}

const updateAmounts = async(req, res) => {
    const {groupID, gameID, userID, newChips, newBuyInAmount} = req.body;

    try {
        await gameService.updateAmounts({groupID, gameID, userID, newChips, newBuyInAmount});
        return res.status(204).send();
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error updating game amounts : ${err}`})
    }
}

const endGame = async(req, res) => {
    const {groupID, gameID, userID, earnings, investment, chipQuantity} = req.body;

    try {
        await gameService.endGame({groupID, gameID, userID, earnings, chipQuantity});
        return res.status(204).send();
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: `Error ending game : ${err}`})
    }
}

module.exports = {
    createGame,
    getGame,
    getPlayerPics,
    buyIn,
    updateSettings,
    updateAmounts,
    endGame
}