const mongoose = require('mongoose');

const groupActivitySchema = new mongoose.Schema({
    groupID: {
        type: String,
        required: true
    },
    userID: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['Create Group', 'Change Name', 'Join', 'Invite', 'Request', 'Leave', 'Remove', 'Other'],
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

groupActivitySchema.index({ groupID: 1, userID: 1, timestamp: 1 }, { unique: true });

const GroupActivity = mongoose.model('GroupActivity', groupActivitySchema);
module.exports = GroupActivity;