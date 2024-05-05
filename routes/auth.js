const express = require('express');
const cookieParser = require("cookie-parser");
const router = express.Router();
const jwt = require('jsonwebtoken');
require('../db');
const Security = require('../models/SecuritySchema');
const Alert = require('../models/AlertSchema');
const Admin = require('../models/AdminSchema');
const Area = require('../models/AllotAreaSchema');
const SubArea = require('../models/AllotSubAreaSchema');
const bycrypthash = require('bcryptjs');
const authenticate = require('../middleware/authenticate');
router.use(cookieParser());
router.post('/Register', async (req, res)=> {
    const { role,userId,firstName,lastName,email,mobileno,city,state,country,zipcode,securitycode,password } = req.body;
    try {
        let user;
        let savedUser;
        const emailExists = await Security.findOne({ email });
        if(emailExists) {
            return res.status(203).json({error: "Email Already Exists"});
        }
        area="Not Alloted";
        user = new Security({ role,userId,firstName,lastName,email,mobileno,area,city,state,country,zipcode,securitycode,password });
        savedUser = await user.save();
        if (savedUser) {
            return res.status(201).json({ message: 'User Registered' });
        }
        else {
            return res.status(422).json({ error: 'User Registration Failed' });
        } 
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/Login',async (req, res) => {
    const { email, password} = req.body;
    if(!email || !password) {
        return res.json({error: "All Field Is Compulsory . Please Fill all the detail"})
    }
    try {
        const userlogin = await Security.findOne({email});
        if(userlogin) {
            const ismatch = await bycrypthash.compare(password,userlogin.password);
            const token = await userlogin.generateAuthToken();
            res.setHeader('jwtoken',token);
            if(ismatch) {
                return res.status(201).json({message:token});
            }
            else {
                return res.status(202).json({error: "Incorrect Password"});
            }
        }
        else {
            console.log("Invalid Username");
            return res.status(200).json({error: "Email does not Exist"});
        }
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/adminlogin',async (req, res) => {
    const { email, password} = req.body;
    if(!email || !password) {
        return res.json({error: "All Field Is Compulsory . Please Fill all the detail"})
    }
    try {
        const userlogin = await Admin.findOne({email});
        if(userlogin) {
            const token = await userlogin.generateAuthToken();
            if(password==userlogin.password) {
                res.setHeader('jwtoken',token);
                return res.status(201).json({message:"Login Successfully"});
            }
            else {
                return res.status(202).json({error: "Incorrect Email & Password"});
            }
        }
        else {
            console.log("Invalid Username");
            return res.status(200).json({error: "Email does not Exist"});
        }
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/dashboard', authenticate ,async (req, res) => {   
    res.send(req.rootUser)
});
router.get('/admindashboard', authenticate ,async (req, res) => {   
    res.send(req.rootUser)
});
router.get('/logout', async (req, res) => {
    console.log("Logout");
    res.status(200).send('User Logout');
});
router.get('/adminlogout', async (req, res) => {
    console.log("Logout");
    res.status(200).send('User Logout');
});
router.get('/alerts',authenticate,async (req,res) => {
    try {
        const securityId = req.userId;
        const allotedarea = await Area.find({securityId});
        if(allotedarea.length > 0) {
            const alerts = [];
            for (const area of allotedarea) {
                const allotedsubarea = await SubArea.find({securityId,area:area.area});
                if(allotedsubarea.length > 0) {
                    for (const subarea of allotedsubarea) {
                        const areaAlerts = await Alert.find({ street_land: subarea.subarea });
                        alerts.push(...areaAlerts);
                    }
                }
            }
            res.json(alerts);
        }
        else {
            res.status(404).json({ error: 'No areas and sub-areas found for the given securityId' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/viewalerts',authenticate,async (req,res) => {
    try {
        const areaAlerts = await Alert.find({});
        res.json(areaAlerts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/viewsecurity',authenticate,async (req,res) => {
    try {
        const securityData = await Security.find({});
        res.json(securityData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/allotarea', async (req, res)=> {
    const { securityId,area,city,state,country } = req.body;
    try {
        let allotedarea;
        let updateData;
        const areaExists = await Area.findOne({ area });
        if(areaExists) {
            return res.status(203).json({error: "Area Already Alloted"});
        }
        const securityData = await Security.findOne({userId:securityId});
        if(city == securityData.city) {
            allotedarea = new Area({securityId,area,city,state,country});
            const save = await allotedarea.save();
            if(save) {
                updateData = {
                    area:'Alloted',
                }
                update = await Security.updateOne({userId:securityId},{
                    $set:updateData
                });
                return res.status(201).json({ message: 'Area Alloted Successfully' });
            }
            else {
                return res.status(422).json({ message: 'Area Allotment Failed' });
            }
        }
        else {
            return res.status(200).json({error: "Area does not match with User City"});
        }
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.post('/allotsubarea', async (req, res)=> {
    const { securityId,subarea,area,city,state,country } = req.body;
    try {
        let allotedsubarea;
        const subareaExists = await SubArea.findOne({ subarea });
        if(subareaExists) {
            return res.status(203).json({error: "Sub-Area Already Alloted"});
        }
        const securityData = await Security.findOne({userId:securityId});
        if(city == securityData.city) {
            allotedsubarea = new SubArea({securityId,subarea,area,city,state,country});
            const save = await allotedsubarea.save();
            if(save) {
                return res.status(201).json({ message: 'Sub-Area Alloted Successfully' });
            }
            else {
                return res.status(422).json({ message: 'Sub-Area Allotment Failed' });
            }
        }
        else {
            return res.status(200).json({error: "Area does not match with User City"});
        }
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/allotedarea',authenticate,async (req,res) => {
    try {
        const securityId = req.userId;
        const allotedarea = await Area.find({securityId});
        res.json(allotedarea);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/allotedareabyadmin',authenticate,async (req,res) => {
    try {
        const allotedarea = await Area.find({});
        res.json(allotedarea);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/allotedsubarea',authenticate,async (req,res) => {
    try {
        const allotedsubarea = await SubArea.find({securityId:req.userId});
        res.json(allotedsubarea);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/allotedsubareabyadmin',authenticate,async (req,res) => {
    try {
        const allotedsubarea = await SubArea.find({});
        res.json(allotedsubarea);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/admindashboard/detail',authenticate,async(req,res) => {
    const securityLength = (await Security.find({})).length;
    const alertLength = (await Alert.find({})).length;
    const areaLength = (await Area.find({})).length;
    const subareaLength = (await SubArea.find({})).length;
    const data = {
        securityLength,
        alertLength,
        areaLength,
        subareaLength
    }
    return res.send(data);
});
router.get('/dashboard/detail',authenticate,async(req,res) => {
    const areaLength = (await Area.find({securityId:req.userId})).length;
    const subareaLength = (await SubArea.find({securityId:req.userId})).length;
    const securityId = req.userId;
    const allotedarea = await Area.find({securityId});
    if(allotedarea.length > 0) {
        for (const area of allotedarea) {
            const allotedsubarea = await SubArea.find({securityId,area:area.area});
            if(allotedsubarea.length > 0) {
                for (const subarea of allotedsubarea) {
                    const alertLength = (await Alert.find({ street_land: subarea.subarea })).length;
                }
            }
        }
    }
    const alertLength = (await Alert.find({})).length;
    const data = {
        alertLength,
        areaLength,
        subareaLength
    }
    return res.send(data);
});
module.exports = router;