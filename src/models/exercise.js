const mongoose = require('mongoose');

const exerciseSchema = mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    date: Date,
    userId: String
},
{
    versionKey: false
});

module.exports = mongoose.model('Exercise', exerciseSchema);
