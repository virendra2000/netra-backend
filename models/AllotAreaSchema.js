const mongoose = require('mongoose');
const AllotAreaSchema = new mongoose.Schema({
    securityId: {
        type: String,
        required:true
    },
    area: {
        type: String,
        required:true
    },
    city: {
        type: String,
        required:true
    },
    state: {
        type: String,
        required:true
    },
    country: {
        type: String,
        required:true
    },
})
const User = mongoose.model('ALLOTAREA', AllotAreaSchema);

module.exports = User