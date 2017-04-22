var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = 3000;

server.listen(port, function(){
    console.log('Server listenning at port %d', port);
});

var userNum  = 0;
var userIdCache = {};

io.on('connection', function(socket){
    userIdCache[socket.id] = 1;
    console.dir('socket', socket);
    socket.emit('news', {hello:'world'});
    console.log('connection create');

    socket.on('set username', function(username, fn){
        if(!username){
            fn(socket.id);
        }
    });
    socket.on('new message', function(data){
        socket.broadcast.emit('new message', {
            userName: data.userName,
            message: data.message
        });
    });
    socket.on('add user', function(userName, fn){
        userNum++;
        socket.userName = userName || userNum;
        fn(socket.userName);
        socket.emit('login', {
            userNum: userNum
        });
        socket.broadcast.emit('user joined', {
            username: userName,
            userNum: userNum
        });
    });

    socket.on('typing', function(){
        socket.broadcast.emit('typing', {
            userName: socket.userName
        });
    });

    socket.on('stop typing', function(){
        socket.broadcast.emit('stop typing', {
            userName: socket.userName,
            userNum:userNum
        });
    });

    socket.on('disconnect', function(){
        userNum--;
        userIdCache[socket.id] = 0;
        socket.broadcast.emit('user left', {
            userName: socket.userName,
            userNum: userNum
        });
    });
});
