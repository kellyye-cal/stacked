const mongoose = require('mongoose');

const gameActivitySchema = new mongoose.Schema({
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
    userID: {
        type: String,
        required: true,
    },
    action: {
        type: String,
        required: true,
        enum: ['Buy In', 'Game Start', 'Set Chip', 'Set Buy In', 'Cash Out', 'Cash Out All', 'Game End', 'Other', 'Remove Player']
    },
    data: {
            type: mongoose.Schema.Types.Mixed,
            required: false
    }
})

gameActivitySchema.index({ gameID: 1, groupID: 1, timestamp: 1 }, { unique: true });

const GameActivity = mongoose.model('GameActivity', gameActivitySchema);
module.exports = GameActivity;