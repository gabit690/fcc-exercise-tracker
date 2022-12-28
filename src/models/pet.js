const mongoose = require('mongoose');

const petSchema = mongoose.Schema({
    name: String,
    age: Number
});
  
module.exports = mongoose.model('Pet', petSchema);
