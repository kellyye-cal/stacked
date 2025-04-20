const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    userA: {
        type: String,
        required: true
    },
    userB: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted"],
        default: 'Pending',
        required: true
    },
    friendsSince: {
        type: Date,
        default: Date.now
    }
})

friendSchema.index({ userA: 1, userB: 1 }, { unique: true });

const Friend = mongoose.model('Friend', friendSchema);
module.exports = Friend;