require('dotenv').config();

var mongoose = require('mongoose');

mongoose.connect('mongodb+srv://marcoquerzola:Mq60906066@softwareframeworks.c1btp.mongodb.net/');

const app = require('express')();

const http = require('http').Server(app);

const userRoute = require('./routes/userRoute');

app.use('/', userRoute);

http.listen(3000, function(){
    console.log('Server is running');
});