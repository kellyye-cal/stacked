const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    groupID: {
        type: String,
        unique: true,
        required: true
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    createdBy: {
        type: String,
        required: true
    }
})

groupSchema.index({ groupID: 1 }, { unique: true });

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;