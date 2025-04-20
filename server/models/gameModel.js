const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    gameID: {
        type: String,
        required: true
    },
    groupID: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    investment: {
        type: Map,
        of: Number,
        default: {}
    },
    earnings: {
        type: Map,
        of: Number,
        default: {}
    },
    buyinPrice: {
        type: Number,
        default: 0
    },
    chipValues: {
        type: Map,
        of: Number,
        default: {}
    },
    sessionName: {
        type: String,
        required: false,
        default: Date.now().toString()
    },
    status: {
        type: String,
        required: true,
        default: "Active",
        enum: ['Active', 'End']
    }
})

gameSchema.index({ gameID: 1, groupID: 1 }, { unique: true });

const Game = mongoose.model('Game', gameSchema);
module.exports = Game;