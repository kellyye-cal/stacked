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
        default: 'Pending',
    }
})

memberSchema.index({ userID: 1, groupID: 1 }, { unique: true });

const Member = mongoose.model('Member', memberSchema);
module.exports = Member;