const mongoose = require('mongoose');

const groupActivitySchema = new mongoose.Schema({
    groupID: {
        type: String,
        unique: true,
        required: true
    },
    userID: {
        type: String,
        unique: true,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['Create Group', 'Change Name', 'Invite', 'Leave', 'Remove', 'Other'],
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

groupActivitySchema.index({ groupID: 1, userID: 1 }, { unique: true });

const GroupActivity = mongoose.model('GroupActivity', groupActivitySchema);
module.exports = GroupActivity;