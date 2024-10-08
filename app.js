require('dotenv').config();

var mongoose = require('mongoose');

mongoose.connect('mongodb+srv://marcoquerzola:Mq60906066@softwareframeworks.c1btp.mongodb.net/');

const app = require('express')();

const http = require('http').Server(app);

const userRoute = require('./routes/userRoute');
const User = require('./models/userModel');
const Chat = require('./models/chatModel');

app.use('/', userRoute);

const io = require('socket.io')(http);

var usp = io.of('/user-namespace');

usp.on('connection', async function(socket){
    console.log('User Connected');

    var userId = socket.handshake.auth.token;

    await User.findByIdAndUpdate({ _id: userId }, { $set:{ is_online:'1' } });

    socket.broadcast.emit('getOnlineUser', { user_id: userId });

    socket.on('disconnect', async function(){
        console.log('User Disconnected');

        var userId = socket.handshake.auth.token;

        await User.findByIdAndUpdate({ _id: userId }, { $set:{ is_online:'0' } });

        socket.broadcast.emit('getOfflineUser', { user_id: userId });
    });

    socket.on('newChat', function(data){
        socket.broadcast.emit('loadNewChat', data);
    });

    socket.on('existsChat', async function(data){
        var chats = await Chat.find({ $or:[
            { sender_id: data.sender_id, receiver_id: data.receiver_id },
            { sender_id: data.receiver_id, receiver_id: data.sender_id },
        ]});

        socket.emit('loadChats', { chats: chats });
    });

    socket.on('chatDeleted', function(id){
        socket.broadcast.emit('chatMessageDeleted', id);
    });

    socket.on('chatUpdated', function(data){
        socket.broadcast.emit('chatMessageUpdated', data);
    });
});

http.listen(3000, function(){
    console.log('Server is running');
});