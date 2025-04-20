const express = require('express')
const router = express.Router();
const gameController = require('../controllers/gameController')
const verifyJWT = require('../middleware/verifyJWT');

router.post('/create', verifyJWT, gameController.createGame);
router.post('/get_game', verifyJWT, gameController.getGame);
router.post('/get_player_pics', verifyJWT, gameController.getPlayerPics)
router.post('/buyin', verifyJWT, gameController.buyIn);
router.post('/updateSettings', verifyJWT, gameController.updateSettings);
router.post('/set_amounts', verifyJWT, gameController.updateAmounts);
router.post('/end_game', verifyJWT, gameController.endGame);

module.exports = router;