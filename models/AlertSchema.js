const mongoose = require('mongoose');
const AlertSchema = new mongoose.Schema({
    label:{
        type: String,
        required:true
    },
    timestamp:{
        type: String,
        required:true
    },
    street_land:{
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
    zipcode: {
        type: String,
        required:true
    },
    cameranumip: {
        type: String,
        required:true
    },
    image_data:Buffer,
    contentType: String,
})
const User = mongoose.model('ALERT', AlertSchema);

module.exports = User