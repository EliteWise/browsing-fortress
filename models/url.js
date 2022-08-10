const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const urlSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    safe: {
        type: Boolean,
        required: true
    },
    threatType: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Url = mongoose.model('Url', urlSchema);
module.exports = Url;