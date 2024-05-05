const mongoose = require('mongoose');
const AllotSubAreaSchema = new mongoose.Schema({
    securityId: {
        type: String,
        required:true
    },
    subarea: {
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
const User = mongoose.model('ALLOTSUBAREA', AllotSubAreaSchema);

module.exports = User