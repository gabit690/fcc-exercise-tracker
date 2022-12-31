const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        unique: true
    }
},
{
    versionKey: false
});

module.exports = mongoose.model('User', userSchema);
