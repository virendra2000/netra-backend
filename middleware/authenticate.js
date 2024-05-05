const Admin = require("../models/AdminSchema");
const Security = require("../models/SecuritySchema");
const jwt = require('jsonwebtoken');
const authenticate = async (req, res, next) => {
    try {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
        const token = req.headers['jwtoken'];
        if (!token) {
            return res.status(401).send('Unauthorized: No Token Provided');
        }
        const verifyToken = jwt.verify(token,process.env.SECRET_KEY);
        let rootUser = await Security.findOne({_id:verifyToken._id,"tokens.token":token});
        if(!rootUser) {
            rootUser = await Admin.findOne({_id:verifyToken._id,"tokens.token":token});
        }
        if(!rootUser) {
            throw new Error('User Not Found')
        }
        req.token = token;
        req.rootUser = rootUser;
        req.userId = rootUser.userId;
        next();
    }
    catch(err) {
        res.status(401).send('Unauthorized : No Token Provided');
        console.log(err);
    }
}
module.exports = authenticate;