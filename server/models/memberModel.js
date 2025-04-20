const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true
    },
    groupID: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ["Invited", "Requested", "Member"],
    },
    netEarnings: {
        type: Number,
        default: 0
    },
    lastSyncedGameID: {
        type: String,
        required: false,
        default: ""
    }
})

memberSchema.index({ userID: 1, groupID: 1 }, { unique: true });

const Member = mongoose.model('Member', memberSchema);
module.exports = Member;