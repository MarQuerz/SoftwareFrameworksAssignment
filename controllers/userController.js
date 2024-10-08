const User = require('../models/userModel');
const Chat = require('../models/chatModel');
const Group = require('../models/groupModel');
const Member = require('../models/memberModel');
const bcrypt = require('bcrypt');
const mongoose = require("mongoose");


const registerLoad = async(req, res)=>{

    try {
        res.render('register');
    } catch (error) {
        console.log(error.message);
    }
}

const register = async(req, res)=>{

    try {
        const passwordHash = await bcrypt.hash(req.body.password, 10);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            image: 'images/'+req.file.filename,
            password: passwordHash
        });

        await user.save();

        res.render('register',{ message: 'Your registration has been successful!'});
    } catch (error) {
        console.log(error.message);
    }
}

const loadLogin = async(req, res) =>{
    try {

        res.render('login');

    } catch (error) {
        console.log(error.message);
    }
}

const login = async(req, res) =>{
    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email:email });
        if(userData){

            const passwordMatch = await bcrypt.compare(password, userData.password);
            if(passwordMatch){
                req.session.user = userData;
                res.cookie('user', JSON.stringify(userData));
                res.redirect('/dashboard');
            }
            else {
                res.render('login',{ message:'Email and Password is incorrect' });
            }

        }
        else{
            res.render('login',{ message:'Email and Password is incorrect' });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const logout = async(req, res) =>{
    try {

        res.clearCookie('user');
        req.session.destroy();
        res.redirect('/');

    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async(req, res) =>{
    try {

        var users = await User.find({ _id: { $nin:[req.session.user._id] } });
        res.render('dashboard', { user: req.session.user, users:users });

    } catch (error) {
        console.log(error.message);
    }
}

const saveChat = async(req, res)=>{
    try {

        var chat = new Chat({
            sender_id: req.body.sender_id,
            receiver_id: req.body.receiver_id,
            message: req.body.message,
        });

        var newChat = await chat.save();
        res.status(200).send({ success: true, msg: 'Chat inserted!', data: newChat });
    } catch(error){
        res.status(400).send({ success: false, msg: error.message });
    }
}

const deleteChat = async(req, res)=>{
    try {
        await Chat.deleteOne({ _id: req.body.id })

        res.status(200).send({ success: true });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const updateChat = async(req, res)=>{
    try {
        
        await Chat.findByIdAndUpdate({ _id: req.body.id },{
            $set:{
                message: req.body.message
            }
        });

        res.status(200).send({ success: true });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const loadGroups = async(req, res)=>{
    try {

        const groups = await Group.find({ creator_id: req.session.user._id });

        res.render('group', { groups: groups});

    } catch (error) {
        console.log(error.message);
    }
}

const createGroups = async(req, res)=>{
    try {
        
        const group = new Group({
            creator_id: req.session.user._id,
            name: req.body.name,
            image: 'images'+req.file.filename,
            limit: req.body.limit
        });

        await group.save();

        const groups = await Group.find({ creator_id: req.session.user._id });
        
        res.render('group', { message: req.body.name+ 'group created successfully', groups: groups});

    } catch (error) {
        console.log(error.message);
    }
}

const getMembers = async(req, res)=>{
    try {
        
        var users = await User.aggregate([
            {
                $lookup:{
                    from: "members",
                    localField: "_id",
                    foreignField: "user_id",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: [ "$group_id", mongoose.Types.ObjectId(req.body.group_id) ] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "member"
                }
            },
            {
                $match: { 
                    "_id": { 
                        $nin:[mongoose.Types.ObjectId(req.session.user._id)] 
                    } 
                }
            }
        ]);

        res.status(200).send({ success: true, data: users });
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const addMembers = async(req, res)=>{
    try {
        
        if(!req.body.members){
            res.status(200).send({ success: false, msg: 'Please select any one member' })
        }
        else if(req.body.members.length > parseInt(req.body.limit)){
            res.status(200).send({ success: false, msg: 'You can not select more than '+req.body.limit+' Members' });
        }
        else {

            await Member.deleteMany({ group_id: req.body.group_id });

            var data = [];

            const members = req.body.members;

            for(let i = 0; i < members.length; i++){
                data.push({
                    group_id: req.body.group_id,
                    user_id: members[i]
                });
            }

            await Member.insertMany(data);

            res.status(200).send({ success: true, msg: 'Members added successfully!' });
        }

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const updateChatGroup = async(req, res) => {

    try {

        if(parseInt(req.body.limit) < parseInt(req.body.last_limit)) {
            await Member.deleteMany({ grouo_id: req.body.id });
        }

        var updateObj;

        if(req.file != undefined){
            updateObj = {
                name: req.body.name,
                image: 'images/'+req.file.filename,
                limit: req.body.limit,

            }
        }
        else {
            updateObj = {
                name: req.body.name,
                limit: req.body.limit
            }
        }

        await Group.findByIdAndUpdate({ _id: req.body.id}, {
            $set: updateObj
        });

        res.status(200).send({ success: true, msg: 'Chat Group updated successfully!' });

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const deleteChatGroup = async(req, res) => {

    try {

        await Group.deleteOne({ _id: req.body.id });
        await Member.deleteMany({ group_id: req.body.id });

        res.status(200).send({ success: true, msg: 'Chat Group deleted successfully!' });

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

module.exports = {
    registerLoad,
    register,
    loadLogin,
    login,
    logout,
    loadDashboard,
    saveChat,
    deleteChat,
    updateChat,
    loadGroups,
    createGroups,
    getMembers,
    addMembers,
    updateChatGroup,
    deleteChatGroup
}