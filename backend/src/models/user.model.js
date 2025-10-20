const mongoose = require('mongoose');





const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        select: false, // do not return password field by default in frontend just for safety
    }
})

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;