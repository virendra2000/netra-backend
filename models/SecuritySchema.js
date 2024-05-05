const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SecuritySchema = new mongoose.Schema({
    role:{
        type: String,
        required:true
    },
    userId:{
        type: String,
        required:true
    },
    firstName:{
        type: String,
        required:true
    },
    lastName:{
        type: String,
        required:true
    },
    email:{
        type: String,
        required:true
    },
    mobileno: {
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
    securitycode: {
        type: String,
        required:true
    },
    password: {
        type: String,
        required:true
    },
    tokens : [
        {
            token : {
                type: String,
                required:true
            }
        }
    ],
})

SecuritySchema.pre('save', async function(next) {
    if(this.isModified('password')) {
        this.password = await bcrypt.hash(this.password,12);
    }
    next();
});
SecuritySchema.methods.generateAuthToken = async function() {
    try {
        let token = jwt.sign({_id:this._id},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    }
    catch(err) {
        console.log(err);
    }
}
const User = mongoose.model('SECURITY', SecuritySchema);

module.exports = User