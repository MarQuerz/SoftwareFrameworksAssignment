require('dotenv').config();

var mongoose = require('mongoose');

mongoose.connect('mongodb+srv://marcoquerzola:Mq60906066@softwareframeworks.c1btp.mongodb.net/');

const app = require('express')();

const http = require('http').Server(app);

const userRoute = require('./routes/userRoute');

app.use('/', userRoute);

const io = require('socket.io')(http);

var usp = io.of('/user-namespace');

usp.on('connection', function(socket){
    console.log('User Connected');

    socket.on('disconnect', function(){
        console.log('User Disconnected');
    });
});

http.listen(3000, function(){
    console.log('Server is running');
});